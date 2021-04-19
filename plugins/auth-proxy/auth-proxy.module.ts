import { Module, DynamicModule } from '@nestjs/common';
import { AuthService } from '@norest/nestjs';
import { AuthService2 } from './auth2.service';

@Module({})
export class AuthProxyModule {
  static register() {
    return {
      module: AuthProxyModule,
      providers: [
        AuthService2,
        { provide: AuthService, useExisting: AuthService2 },
      ],
    } as DynamicModule;
  }
}
