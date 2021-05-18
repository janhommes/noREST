import { Module, DynamicModule } from '@nestjs/common';
import { AuthProxyConfig } from './auth-proxy-config.interface';
import { GitHubAuthController } from './github/github-auth.controller';

@Module({})
export class AuthProxyModule {
  static register(config: AuthProxyConfig = {}) {
    return {
      module: AuthProxyModule,
      controllers: [GitHubAuthController],
      providers: [
        { provide: 'PLUGIN_AUTH_PROXY_CONFIG_TOKEN', useValue: config },
      ],
    } as DynamicModule;
  }
}
