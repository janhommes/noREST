import { Module, DynamicModule } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { PrivateInterceptor } from './interceptors/private.interceptor';
import { ReferenceInterceptor } from './interceptors/reference.interceptor';
import { ConfigModule } from '../config/config.module';
import { NoRestConfig } from '../norest-config.interface';

@Module({
  imports: [ConfigModule],
  providers: [
    AuthService,
    AuthGuard,
    PrivateInterceptor,
    ReferenceInterceptor
  ],
  exports: [AuthService, AuthGuard, PrivateInterceptor, ReferenceInterceptor],
})
export class AuthModule {
  static async register(config?: NoRestConfig): Promise<DynamicModule> {
    return {
      module: AuthModule,
      imports: [ConfigModule.register(config)],
      providers: [
        AuthService,
        AuthGuard,
        PrivateInterceptor,
        ReferenceInterceptor,
      ],
      exports: [
        AuthService,
        AuthGuard,
        PrivateInterceptor,
        ReferenceInterceptor,
      ],
    };
  }
}
