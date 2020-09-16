import { environment } from '../../environments/environment';
import { Methods } from '../common/methods';
import { Observable, BehaviorSubject, ReplaySubject } from 'rxjs';
import { ThrowStmt } from '@angular/compiler';

export class Realtime {
  socket: WebSocket;
  status$ = new BehaviorSubject<{
    isConnected: boolean;
    isConnecting: boolean;
    hasError?: boolean;
    errorMsg?: string;
  }>({
    isConnected: false,
    isConnecting: false,
  });
  message$ = new ReplaySubject<{ date: number; payload: any }>();
  methods = Methods;

  private reconnectTimer = 1000;
  private heartBeatInterval;
  private readonly HEART_BEAT_INTERVAL_TIME = 25000;

  constructor(private key: string, private uri: string) {}

  connect() {
    this.status$.next({
      isConnected: false,
      isConnecting: true,
      hasError: false,
    });
    this.socket = new WebSocket(
      `${this.getProtocol()}${environment.wsUri}${environment.path}/${
        this.key
      }${this.uri}`,
    );
    this.socket.onopen = () => this.onConnectionOpen();
    this.socket.onclose = msg => this.onConnectionClose(msg);
    this.socket.onmessage = msg => this.onMessage(msg);
    this.socket.onerror = msg => this.onError(msg);
  }

  onError(msg: Event): any {
    this.status$.next({
      isConnected: false,
      isConnecting: false,
      hasError: true,
      errorMsg: `❌ Realtime failed to connect. Trying to reconnect in ${this.reconnectTimer / 1000}s.`,
    });
  }

  disconnect() {
    this.status$.next({
      isConnected: false,
      isConnecting: false,
      hasError: false,
    });
    this.socket.close();
    clearInterval(this.heartBeatInterval);
  }

  reconnect() {
    this.status$.next({
      isConnected: false,
      isConnecting: true,
      hasError: false,
    });
    this.reconnectTimer *= 2;
    this.socket.close();
    setTimeout(() => this.connect(), this.reconnectTimer);
  }

  private getProtocol(prefix = 'ws') {
    if (window.location.protocol.endsWith('s:')) {
      return `${prefix}s:`;
    }
    return `${prefix}:`;
  }

  private onConnectionOpen(): void {
    this.status$.next({
      isConnected: true,
      isConnecting: false,
      hasError: false,
    });
    this.heartBeatInterval = setInterval(
      () => this.ping(),
      this.HEART_BEAT_INTERVAL_TIME,
    );
  }

  private ping(): void {
    this.socket.send(JSON.stringify({ event: 'ping', data: 'pong' }));
  }

  private onMessage(msg: MessageEvent): any {
    const payload = JSON.parse(msg.data);
    if (payload.ping) {
      return;
    } else if (payload.data) {
      this.reconnectTimer = 1000;
      this.message$.next({ date: Date.now(), payload });
      return;
    }
    this.status$.next({
      isConnected: false,
      isConnecting: false,
      hasError: true,
      errorMsg: `❌ Realtime failed: ${payload.message}`,
    });
    this.socket.close();
  }

  private onConnectionClose(msg): void {
    clearInterval(this.heartBeatInterval);
    this.status$.next({
      isConnected: false,
      isConnecting: false,
      hasError: false,
    });
    if (msg.wasClean) {
      return;
    }
    this.reconnect();
  }
}
