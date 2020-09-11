import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
} from '@nestjs/common';
import { Observable, isObservable, merge, empty } from 'rxjs';
import { map, switchMap, tap } from 'rxjs/operators';
import { NoRestConfig } from '../norest-config.interface';
import { NOREST_CONFIG_TOKEN } from '../common/constants';
import { isFunction } from 'lodash';
import { Response, Request } from 'express';

@Injectable()
export class RequestResponseInterceptor implements NestInterceptor {
  constructor(@Inject(NOREST_CONFIG_TOKEN) private config: NoRestConfig) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (isFunction(this.config.rest.request)) {
      this.config.rest.request(context);
    }

    return next
      .handle()
      .pipe(
        map(data =>
          isFunction(this.config.rest.response)
            ? this.config.rest.response(context, data)
            : data,
        ),
      );
  }
}
