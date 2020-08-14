import { Component } from '@angular/core';
import { QueryService } from './query.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor(public queryService: QueryService) {}
}
