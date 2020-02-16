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
import {
  DEFAULT_REFERENCE_PREFIX,
  DEFAULT_REFERENCE_DB_KEY,
} from '../common/constants';

/**
 * A interceptor that converts references to single instances.
 * E.g. '@_category': 1 gets @: [{ id: 1, fragment: category }].
 * That makes querying on delete easier, as you don't have to
 * remember the fragment.
 */
@Injectable()
export class ReferenceInterceptor implements NestInterceptor {
  constructor(private auth: AuthService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    if (['POST', 'PUT', 'PATCH'].includes(request.method)) {
      request.body = this.unmapValues(request.body);
    }

    return next.handle().pipe(
      map(values => {
        if (!values.data) {
          return this.mapValues(values);
        }
        values.data = values.data.map(value => this.mapValues(value));
        return values;
      }),
    );
  }

  private unmapValues(value) {
    Object.keys(value).forEach(key => {
      if (key.startsWith(DEFAULT_REFERENCE_PREFIX)) {
        if (!value[DEFAULT_REFERENCE_DB_KEY]) {
          value[DEFAULT_REFERENCE_DB_KEY] = [];
        }
        if (Array.isArray(value[key])) {
          value[DEFAULT_REFERENCE_DB_KEY] = [
            ...value[DEFAULT_REFERENCE_DB_KEY],
            ...value[key].map(id => ({ id, fragment: key })),
          ];
        } else {
          value[DEFAULT_REFERENCE_DB_KEY].push({
            id: value[key],
            fragment: key,
            oneToOne: true,
          });
        }
      }
    });

    return _.omitBy(value, (val, k) => k.startsWith(DEFAULT_REFERENCE_PREFIX));
  }

  private mapValues(value) {
    const references: any[] = _.get(value, DEFAULT_REFERENCE_DB_KEY);
    if (references) {
      references.forEach(({ id, fragment, oneToOne }) => {
        const key =  fragment;
        if (oneToOne) {
          value[key] = id;
        } else {
          value[key] = [...(value[key] ? value[key] : []), id];
        }
      });
    }

    return _.omit(value, [DEFAULT_REFERENCE_DB_KEY]);
  }
}
