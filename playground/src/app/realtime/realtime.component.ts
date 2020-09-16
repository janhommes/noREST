import { Component, OnInit, OnDestroy } from '@angular/core';
import { Methods } from '../common/methods';
import { RealtimeDialogComponent } from '../realtime-dialog/realtime-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute } from '@angular/router';
import { Realtime } from './realtime';
import { Subscription } from 'rxjs';

@Component({
  selector: 'nr-realtime',
  templateUrl: './realtime.component.html',
  styleUrls: ['./realtime.component.scss'],
})
export class RealtimeComponent implements OnInit, OnDestroy {
  uri = '/';
  label = 'Connected to';
  messages = [];
  methods = Methods;

  realtime: Realtime;

  private rtMessageSub: Subscription;
  private rtStatusSub: Subscription;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private activeRoute: ActivatedRoute,
  ) {}

  ngOnInit(): void {
    this.connect();
  }

  openDetails(msg): void {
    this.dialog.open(RealtimeDialogComponent, {
      width: '90vh',
      data: msg,
    });
  }

  connect() {
    const key = this.activeRoute.snapshot.params.key;
    this.realtime = new Realtime(key, this.uri);
    this.realtime.connect();
    this.rtMessageSub = this.realtime.message$.subscribe(msg => {
      this.messages.push(msg);
    });
    this.rtStatusSub = this.realtime.status$.subscribe(
      ({ hasError, errorMsg }) => {
        if (hasError) {
          this.snackBar.open(errorMsg, 'dismiss', {
            duration: 4000,
            panelClass: 'warn',
          });
        }
      },
    );
  }

  disconnect() {
    this.realtime.disconnect();
    this.label = 'URI';
    this.messages = [];
    this.unsubscribeObservables();
  }

  unsubscribeObservables() {
    if (this.rtMessageSub) {
      this.rtMessageSub.unsubscribe();
    }
    if (this.rtStatusSub) {
      this.rtStatusSub.unsubscribe();
    }
  }

  ngOnDestroy(): void {
    this.unsubscribeObservables();
  }
}
