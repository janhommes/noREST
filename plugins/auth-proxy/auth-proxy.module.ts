import { Module, DynamicModule } from '@nestjs/common';
import { AuthGuard } from './auth-proxy.guard';
import {
  AuthService,
  NoRestModule,
  NOREST_AUTH_CONFIG_TOKEN,
} from '@norest/nestjs';
import { AuthService2 } from './auth2.service';

@Module({
  imports: [],
  providers: [
    // { provide: NOREST_AUTH_CONFIG_TOKEN, useValue: {} },
    // AuthService,
    // AuthGuard,
    AuthService2,
    { provide: AuthService, useExisting: AuthService2 },
  ],
})
export class AuthProxyModule {
  static register() {
    console.log('REG!!! PLUGIN!');
    return {
      module: AuthProxyModule,
      providers: [
        { provide: NOREST_AUTH_CONFIG_TOKEN, useValue: {} },
        AuthService,
        AuthGuard,
      ],
      global: true,
    } as DynamicModule;
  }
}
