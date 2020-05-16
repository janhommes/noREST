import { Injectable, HttpStatus, HttpException, Inject } from '@nestjs/common';
import { NOREST_AUTH_CONFIG_TOKEN } from '../common/constants';
import { Request } from 'express';
import { AuthConfig } from './auth-config.interface';
import { Messages } from '../common/messages';

export type AuthenticatedRequest = Request & { auth? };

@Injectable()
export class AuthService {
  public isAuthenticated = false;
  public user: string;

  constructor(
    @Inject(NOREST_AUTH_CONFIG_TOKEN) private authConfig: AuthConfig,
  ) {}

  authenticate(request: AuthenticatedRequest) {
    if (!request.auth) {
      const headers = request.headers;
      const jwt = this.getJwt(headers, request.query);
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
