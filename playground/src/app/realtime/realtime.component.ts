import { Component, OnInit } from '@angular/core';
import { Methods } from '../common/methods';
import { RealtimeDialogComponent } from '../realtime-dialog/realtime-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from '../../environments/environment';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'nr-realtime',
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.scss'],
})
export class RealtimeComponent implements OnInit {
  uri = '/';
  label = 'Connected to';
  isConnected = true;
  isConnecting = false;
  socket: WebSocket;
  messages = [];
  methods = Methods;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private activeRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.connect();
  }

  disconnect() {
    this.isConnected = false;
    this.label = 'URI';
    this.messages = [];
    this.socket.close();
  }

  connect() {
    const key = this.activeRoute.snapshot.params.key;
    this.isConnecting = true;
    this.label = 'Connected to';
    this.socket = new WebSocket(
      `${environment.wsUri}${environment.path}/${key}${this.uri}`,
    );
    this.socket.onopen = () => {
      this.isConnecting = false;
      this.isConnected = true;
      this.socket.onmessage = msg => {
        const payload = JSON.parse(msg.data);
        if (payload.data) {
          this.messages.push({ date: Date.now(), payload });
        } else {
          this.snackBar.open(
            `❌ Realtime failed: ${payload.message}`,
            'dismiss',
            {
              duration: 4000,
              panelClass: 'warn',
            },
          );
          this.isConnected = false;
          this.socket.close();
        }
      };
    };
  }

  openDetails(msg): void {
    this.dialog.open(RealtimeDialogComponent, {
      width: '90vh',
      data: msg,
    });
  }
}
