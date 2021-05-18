import {
  Injectable,
  HttpStatus,
  HttpException,
  Inject,
  Optional,
} from '@nestjs/common';
import { NOREST_AUTH_CONFIG_TOKEN, DEFAULT_CONFIG } from '../common/constants';
import { Request } from 'express';
import { AuthConfig } from './auth-config.interface';
import { Messages } from '../common/messages';
import { verify } from 'jsonwebtoken';

export type AuthenticatedRequest = Request & { auth? };

@Injectable()
export class AuthService {
  public isAuthenticated = false;
  public user: string;

  constructor(
    @Optional()
    @Inject(NOREST_AUTH_CONFIG_TOKEN)
    protected authConfig: AuthConfig = DEFAULT_CONFIG.auth,
  ) {}

  authenticate(request: AuthenticatedRequest) {
    if (!this.authConfig.enabled) {
      request.auth = {
        isAuthenticated: true,
        user: 'anonymous', // TODO: add a config
      };
      return;
    }
    if (!request.auth) {
      const headers = request.headers;
      let query = request.query;
      if ((request as any).channel) {
        // TODO: WS very hackie approach for auth with query parameter
        // should be improved.
        query = {
          [this.authConfig.cookieName]: new URL(
            (request as any).channel,
          ).searchParams.get(this.authConfig.cookieName),
        };
      }
      const jwt = this.getJwt(headers, query);
      const verified = jwt && this.verifyJwt(jwt);
      request.auth = {
        isAuthenticated: !!verified,
        user: verified ? this.getUserFromJwt(jwt) : undefined,
      };
    }
  }

  getJwt(headers: any, query: any) {
    if (query && query[this.authConfig.cookieName]) {
      return query[this.authConfig.cookieName];
    }

    let authHeader = headers.authorization || headers.cookie;
    if (headers.cookie && !headers.authorization) {
      authHeader = this.getCookieByName(authHeader, this.authConfig.cookieName);
    }
    if (!authHeader) {
      return;
    }
    return authHeader.replace(/Bearer /i, '');
  }

  getUserFromJwt(jwt: any) {
    return this.getJwtContent(jwt)[this.authConfig.userProperty];
  }

  private verifyJwt(jwt: string) {
    if (!this.authConfig.jwt || !this.authConfig.jwt.verify) {
      return true;
    }
    try {
      verify(
        jwt,
        this.authConfig.jwt.secretOrPublicKey,
        this.authConfig.jwt.options,
      );
      return true;
    } catch (ex) {
      throw new HttpException(Messages.INVALID_JWT, HttpStatus.UNAUTHORIZED);
    }
  }

  private getCookieByName(cookies: string, name: string) {
    const match = cookies.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) {
      return match[2];
    }
    return;
  }

  private getJwtContent(token: string) {
    if (token.split('.').length !== 3) {
      throw new HttpException(Messages.INVALID_JWT, HttpStatus.UNAUTHORIZED);
    }
    try {
      return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
    } catch (ex) {
      throw new HttpException(Messages.INVALID_JWT, HttpStatus.UNAUTHORIZED);
    }
  }
}
