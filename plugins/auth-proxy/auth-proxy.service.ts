import {
  Injectable,
  HttpStatus,
  HttpException,
  Inject,
  Optional,
} from '@nestjs/common';
import { Request } from 'express';
import {
  NOREST_AUTH_CONFIG_TOKEN,
  DEFAULT_CONFIG,
  Messages,
  AuthService,
  AuthenticatedRequest,
} from '@norest/nestjs';
import { AuthProxyConfig } from './auth-proxy-config.interface';

@Injectable()
export class AuthProxyService extends AuthService {
  constructor(
    @Optional()
    @Inject(NOREST_AUTH_CONFIG_TOKEN)
    protected authConfig: any = DEFAULT_CONFIG.auth,
    @Inject('PLUGIN_AUTH_PROXY_CONFIG_TOKEN')
    protected proxyAuthConfig: AuthProxyConfig,
  ) {
    super(authConfig);
  }

  authenticate(request: AuthenticatedRequest) {
    return super.authenticate(request);
  }
}
