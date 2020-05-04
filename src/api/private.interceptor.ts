import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { _ } from 'lodash';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as WebSocket from 'ws';
import { DEFAULT_INDEX_FRAGMENT_PREFIX } from '../common/constants';
import { AuthService } from './auth.service';

@Injectable()
export class PrivateInterceptor implements NestInterceptor {
  constructor(private auth: AuthService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    let request = context.switchToHttp().getRequest();
    if (request instanceof WebSocket) {
      request = context.switchToWs().getData();
    }

    this.auth.authenticate(request);
    return next.handle().pipe(
      map(values => {
        if (request.auth.isAuthenticated) {
          return values;
        }
        if (!values.data) {
          return this.omit(values);
        }
        values.data = values.data.map(value => this.omit(value));
        return values;
      }),
    );
  }

  omit(value) {
    return _.omitBy(value, (val, key) =>
      key.startsWith(DEFAULT_INDEX_FRAGMENT_PREFIX),
    );
  }
}
