import { DynamicModule, Module } from '@nestjs/common';
import { normalizeConfig } from './common/normalize';
import { resolveConnector } from './common/resolver';
import { ConnectorFactory } from './connector/connector.interface';
import { ConnectorModule } from './connector/connector.module';
import { NoRestConfig } from './norest-config.interface';
import { ConfigModule } from './config/config.module';
import { AuthService } from './auth/auth.service';
import { AuthGuard } from './auth/auth.guard';
import { PrivateInterceptor } from './auth/interceptors/private.interceptor';
import { ReferenceInterceptor } from './auth/interceptors/reference.interceptor';
import { WebsocketGateway } from './websocket/websocket.gateway';
import { RequestResponseInterceptor } from './rest/request-response.interceptor';
import { RestController } from './rest/rest.controller';

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
export class NoRestModule {
  static async forRoot(
    config?: Partial<NoRestConfig>,
    databaseConnector?: ConnectorFactory,
  ): Promise<DynamicModule> {
    return NoRestModule.register(config, databaseConnector);
  }

  static async register(
    config?: Partial<NoRestConfig>,
    databaseConnector?: ConnectorFactory,
  ): Promise<DynamicModule> {
    const noRestConfig = await normalizeConfig(config);
    const connector = resolveConnector(
      noRestConfig.connector.name,
      databaseConnector,
    );
    console.log(noRestConfig.plugins);
    console.log('using for register!!');
    const providers = [
      AuthService,
      AuthGuard,
      PrivateInterceptor,
      ReferenceInterceptor,
      WebsocketGateway,
      RequestResponseInterceptor,
      ...(noRestConfig.plugins?.providers || [])
    ];

    return {
      module: NoRestModule,
      providers,
      imports: [
        ConfigModule.register(noRestConfig),
        ConnectorModule.register(noRestConfig, connector),
        ...(noRestConfig.plugins?.imports || []),
      ],
      controllers: [RestController],
      exports: [ConnectorModule],
    };
  }
}
