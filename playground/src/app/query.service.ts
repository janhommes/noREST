import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Query } from './common/query.interface';

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  query$ = new BehaviorSubject<Query>(null);

  trigger(query: Query) {
    console.log(query);
    if (!query.options) {
      query.options = {};
    }
    this.query$.next(query);
  }
}
