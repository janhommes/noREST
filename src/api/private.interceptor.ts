import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { _ } from 'lodash';
import { AuthService } from './auth.service';
import { DEFAULT_INDEX_FRAGMENT_PREFIX } from '../common/constants';

@Injectable()
export class PrivateInterceptor implements NestInterceptor {
  constructor(private auth: AuthService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
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

  private omit(value) {
    return _.omitBy(value, (val, key) =>
      key.startsWith(DEFAULT_INDEX_FRAGMENT_PREFIX),
    );
  }
}
