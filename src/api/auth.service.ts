import {
  Injectable,
  HttpStatus,
  HttpException,
  Scope,
  Inject,
} from '@nestjs/common';
import { API_CONFIG_TOKEN } from '../common/constants';
import { ApiConfig } from './api-config.interface';
import { Request } from 'express';

export type AuthenticatedRequest = Request & { auth? };

@Injectable()
export class AuthService {
  public isAuthenticated = false;
  public user: string;

  constructor(@Inject(API_CONFIG_TOKEN) private apiConfig: ApiConfig) {}

  authenticate(request: AuthenticatedRequest) {
    if (!request.auth) {
      const headers = request.headers;
      const jwt = this.getJwt(headers);
      request.auth = {
        isAuthenticated: !!jwt,
        user: jwt ? this.getUserFromJwt(jwt) : undefined,
      };
    }
  }

  getJwt(headers: any) {
    let authHeader = headers.authorization || headers.cookie;
    if (headers.cookie) {
      authHeader = this.getCookieByName(
        authHeader,
        this.apiConfig.config.auth.cookieName,
      );
    }
    if (!authHeader) {
      return;
    }
    return this.getJwtContent(authHeader.replace(/Bearer /i, ''));
  }

  getUserFromJwt(jwt: any) {
    return jwt[this.apiConfig.config.auth.userProperty];
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
      throw new HttpException(
        'The given authorization is not a valid JWT.',
        HttpStatus.UNAUTHORIZED,
      );
    }
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  }
}
