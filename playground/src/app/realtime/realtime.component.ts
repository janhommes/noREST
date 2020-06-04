import { Component, OnInit } from '@angular/core';
import { Methods } from '../common/methods';
import { RealtimeDialogComponent } from '../realtime-dialog/realtime-dialog.component';
import { MatDialog } from '@angular/material/dialog';

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

  constructor(private dialog: MatDialog) {}

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
    this.isConnecting = true;
    this.label = 'Connected to';
    this.socket = new WebSocket('ws://localhost:3030/api' + this.uri);
    this.socket.onopen = () => {
      this.isConnecting = false;
      this.isConnected = true;
      this.socket.onmessage = msg => {
        this.messages.push({ date: Date.now(), payload: JSON.parse(msg.data) });
      };
    };
  }

  openDetails(msg): void {
    this.dialog.open(RealtimeDialogComponent, {
      width: '90vh',
      data: msg
    });

    /*dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.animal = result;
    });*/
  }
}
