import { Module } from '@nestjs/common';
import { AuthGuard } from './auth/auth.guard';
import { AuthService } from './auth/auth.service';
import { PrivateInterceptor } from './auth/interceptors/private.interceptor';
import { ReferenceInterceptor } from './auth/interceptors/reference.interceptor';
import { ConfigModule } from './config/config.module';
import { ConnectorModule } from './connector/connector.module';
import { RequestResponseInterceptor } from './rest/request-response.interceptor';
import { RestController } from './rest/rest.controller';
import { WebsocketGateway } from './websocket/websocket.gateway';

/**
 * The main module to be used in other nestjs 
 * applications. It is always using the default
 * configuration. Use NoRestCliModule.register()
 * for a configurable module.
 * 
 * Todo: The modules are split into two, because of an issue
 * where two imports where loaded. Later we might want to unify
 * them again.
 */
@Module({
  providers: [
    AuthService,
    AuthGuard,
    PrivateInterceptor,
    ReferenceInterceptor,
    WebsocketGateway,
    RequestResponseInterceptor,
  ],
  controllers: [RestController],
  imports: [ConfigModule, ConnectorModule],
  exports: [ConnectorModule],
})
export class NoRestModule {}
