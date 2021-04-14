import { Injectable, HttpStatus, HttpException, Inject, Optional } from '@nestjs/common';
//import { NOREST_AUTH_CONFIG_TOKEN, DEFAULT_CONFIG } from '../common/constants';
import { Request } from 'express';
import { NOREST_AUTH_CONFIG_TOKEN, DEFAULT_CONFIG, Messages } from '@norest/nestjs';
//import { AuthConfig } from './auth-config.interface';
//import { Messages } from '../common/messages';

export type AuthenticatedRequest = Request & { auth? };

@Injectable()
export class AuthService2 {
  public isAuthenticated = false;
  public user: string;

  constructor(
    @Optional() @Inject(NOREST_AUTH_CONFIG_TOKEN) private authConfig: any = DEFAULT_CONFIG.auth
  ) {}

  authenticate(request: AuthenticatedRequest) {
    console.log('new wohoo :)');
    if (!this.authConfig.enabled) {
      request.auth = {
        isAuthenticated: true,
        user: 'anonymous',
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
      request.auth = {
        isAuthenticated: !!jwt,
        user: jwt ? this.getUserFromJwt(jwt) : undefined,
      };
    }
  }

  getJwt(headers: any, query: any) {
    if (query && query[this.authConfig.cookieName]) {
      return this.getJwtContent(query[this.authConfig.cookieName]);
    }

    let authHeader = headers.authorization || headers.cookie;
    if (headers.cookie && !headers.authorization) {
      authHeader = this.getCookieByName(authHeader, this.authConfig.cookieName);
    }
    if (!authHeader) {
      return;
    }
    return this.getJwtContent(authHeader.replace(/Bearer /i, ''));
  }

  getUserFromJwt(jwt: any) {
    return jwt[this.authConfig.userProperty];
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
