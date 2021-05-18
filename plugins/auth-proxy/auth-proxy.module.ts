import { Module, DynamicModule } from '@nestjs/common';
import { AuthService } from '@norest/nestjs';
import { AuthProxyService } from './auth-proxy.service';
import { AuthProxyConfig } from './auth-proxy-config.interface';
import { GitHubAuthController } from './github/github-auth.controller';

@Module({})
export class AuthProxyModule {
  static register(config: AuthProxyConfig = {}) {
    return {
      module: AuthProxyModule,
      controllers: [GitHubAuthController],
      providers: [
        AuthProxyService,
        { provide: 'PLUGIN_AUTH_PROXY_CONFIG_TOKEN', useValue: config },
        { provide: AuthService, useExisting: AuthProxyService },
      ]
    } as DynamicModule;
  }
}
