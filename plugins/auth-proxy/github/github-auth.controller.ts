/* eslint-disable @typescript-eslint/camelcase */
import {
  Controller,
  Scope,
  Get,
  Inject,
  Redirect,
  Req,
  Query,
  HttpException,
  HttpStatus,
  Res,
} from '@nestjs/common';
import { AuthProxyConfig } from '../auth-proxy-config.interface';
import { _ } from 'lodash';
import { Request, Response } from 'express';
import { default as fetch } from 'node-fetch';
import { sign } from 'jsonwebtoken';
import {
  NOREST_AUTH_CONFIG_TOKEN,
  DEFAULT_CONFIG,
  AuthConfig,
} from '@norest/nestjs';

@Controller({
  scope: Scope.DEFAULT,
  path: 'github',
})
export class GitHubAuthController {
  constructor(
    @Inject('PLUGIN_AUTH_PROXY_CONFIG_TOKEN') private config: AuthProxyConfig,
    @Inject(NOREST_AUTH_CONFIG_TOKEN)
    protected authConfig: AuthConfig = DEFAULT_CONFIG.auth,
  ) {}

  @Get('login')
  @Redirect('https://github.com/login/oauth/authorize', 302)
  login(@Req() req: Request) {
    const url = new URL('https://github.com/login/oauth/authorize');
    const redirectUrl = `${req.protocol}://${req.get('host')}/github/auth`;
    _.forEach(this.config.github, (value, key) => {
      if (value && !['client_secret', 'redirect_uri'].includes(key)) {
        url.searchParams.append(key, value);
      }
    });
    url.searchParams.append('redirect_uri', redirectUrl);
    return { url: url.toString() };
  }

  @Get('auth')
  async auth(
    @Res({ passthrough: true }) response: Response,
    @Query('state') toProveState,
    @Query('code') code,
  ) {
    if (this.config.github.state !== toProveState) {
      throw new HttpException(
        'Invalid state parameter',
        HttpStatus.BAD_REQUEST,
      );
    }
    const {
      client_secret,
      client_id,
      redirect_uri,
      state,
    } = this.config.github;
    const data = {
      client_secret,
      client_id,
      redirect_uri,
      state,
      code,
    };
    const result = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    const accessResponse = await result.json();
    if (accessResponse.error) {
      throw new HttpException(
        accessResponse.error_description,
        HttpStatus.BAD_REQUEST,
      );
    }
    const sub = await this.getUserName(accessResponse);
    const signedJwt = sign(
      { ...accessResponse, sub },
      this.authConfig.jwt.secretOrPrivateKey,
      this.authConfig.jwt.options,
    );
    response.cookie(this.authConfig.cookieName, signedJwt, {
      httpOnly: true,
    });
    return { message: `${sub} successful logged in.`, status: 200 };
  }

  @Get('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(this.authConfig.cookieName, {
      httpOnly: true,
    });
    return { message: `Successful logged out.`, status: 200 };
  }

  async getUserName(accessResponse: any) {
    const result = await fetch('https://api.github.com/user', {
      method: 'GET',
      headers: {
        Accept: 'application/vnd.github.v3+json',
        Authorization: `Bearer ${accessResponse.access_token}`,
      },
    });
    const userEntity = await result.json();
    return userEntity.login;
  }
}
