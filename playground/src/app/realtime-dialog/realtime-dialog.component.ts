import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'nr-realtime-dialog',
  templateUrl: './realtime-dialog.component.html',
  styleUrls: ['./realtime-dialog.component.scss'],
})
export class RealtimeDialogComponent {
  payload = '';
  date;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any) {
    this.payload = JSON.stringify(this.data.payload, null, 2);
    this.date = this.data.date;
  }

  editorOptions = {
    theme: 'vs-light',
    language: 'json',
    readOnly: true,
    automaticLayout: true
  };
}
