import {
  DynamicModule,
  Module,
  Provider,
  ForwardReference,
  Type,
  Abstract,
} from '@nestjs/common';
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
import { Logger } from '@nestjs/common';

@Module({})
export class NoRestCliModule {
  static async forRoot(
    config?: Partial<NoRestConfig>,
    databaseConnector?: ConnectorFactory,
  ): Promise<DynamicModule> {
    return NoRestCliModule.register(config, databaseConnector);
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

    const mainModule: DynamicModule = {
      module: NoRestCliModule,
      providers: [
        AuthService,
        AuthGuard,
        PrivateInterceptor,
        ReferenceInterceptor,
        WebsocketGateway,
        RequestResponseInterceptor,
      ],
      imports: [
        ConfigModule.register(noRestConfig),
        ConnectorModule.register(noRestConfig, connector),
      ],
      controllers: [RestController],
      exports: [ConnectorModule],
    };
    const { plugins } = noRestConfig;
    (plugins || []).forEach((plugin: DynamicModule) => {
      mainModule.providers.push(...(plugin.providers || []));
      mainModule.controllers.push(...(plugin.controllers || []));
      mainModule.imports.push(...(plugin.imports || []));
      mainModule.exports.push(...(plugin.exports || []));
      Logger.log(`${plugin.module.name} loaded`, 'PluginLoader');
    });

    return mainModule;
  }
}
