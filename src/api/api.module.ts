import { DynamicModule, Module, Provider, Logger } from '@nestjs/common';
import { cosmiconfig } from 'cosmiconfig';
import { _ } from 'lodash';
import { API_CONFIG_TOKEN, DEFAULT_PAGE_SIZE } from '../common/constants';
import { Connector } from '../connector/connector.interface';
import { ConnectorModule } from '../connector/connector.module';
import { ApiConfig } from './api-config.interface';
import { ApiController } from './api.controller';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { PrivateInterceptor } from './private.interceptor';
import { WebsocketGateway } from './websocket.gateway';

@Module({})
export class ApiModule {
  private static configExplorer = cosmiconfig('norest');
  private static defaultConfig: ApiConfig = {
    db: {
      name: 'mock',
      url: '',
      collection: 'norest',
    },
    config: {
      auth: {
        userProperty: 'sub',
        cookieName: 'auth',
        jwtValidation: false,
        mode: '',
        secret: '',
      },
      baseRoute: 'api',
      fixed: false,
      defaultPageSize: DEFAULT_PAGE_SIZE
    },
  };

  static async forRoot(
    config?: Partial<ApiConfig>,
    databaseConnector?: Provider<Connector>,
  ): Promise<DynamicModule> {
    return ApiModule.register(config, databaseConnector);
  }

  static async register(
    config?: Partial<ApiConfig>,
    databaseConnector?: Provider<Connector>,
  ): Promise<DynamicModule> {
    const fileConfig = await ApiModule.configExplorer.search();
    const apiConfig = _.merge(ApiModule.defaultConfig, fileConfig ? fileConfig.config : {}, config);
    const connector = ConnectorModule.getConnector(
      apiConfig.db.name,
      databaseConnector,
    );
    return {
      module: ApiModule,
      providers: [
        AuthService,
        AuthGuard,
        WebsocketGateway,
        PrivateInterceptor,
        { provide: API_CONFIG_TOKEN, useValue: apiConfig },
      ],
      controllers: [ApiController],
      imports: [ConnectorModule.register(connector, apiConfig.db)],
    };
  }
}
