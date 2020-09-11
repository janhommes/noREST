import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Query } from './common/query.interface';
import { environment } from '../environments/environment';
import { HttpClient } from '@angular/common/http';
import { tap, finalize} from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class QueryService {
  query$ = new BehaviorSubject<Query>(null);
  isLoading = false;
  private _key = '';

  set key(value) {
    this._key = value;
  }

  constructor(private http: HttpClient) {}

  trigger(query: Query) {
    if (!query.options) {
      query.options = {};
    }
    this.query$.next(query);
  }

  execute(query: Query, isLoadingFinished = true) {
    const req$ = this.http
      .request(query.method, `${this.getBaseUrl()}/${query.uri}`, {
        responseType: 'json',
        body: query.body,
        headers: query.options.headers,
      })
      .pipe(
        tap(() => (this.isLoading = true)),
        finalize(() => (this.isLoading = !isLoadingFinished)),
      );
    return req$;
  }

  getBaseUrl() {
    return `${this.getProtocol()}${environment.httpUri}${environment.path}/${this._key}`;
  }

  getProtocol(prefix = 'http') {
    if (window.location.protocol.endsWith('s:')) {
      return `${prefix}s:`;
    }
    return `${prefix}:`;
  }
}
