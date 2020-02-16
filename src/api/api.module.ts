import { Module, DynamicModule, Provider } from '@nestjs/common';
import { ApiController } from './api.controller';
import { AuthService } from './auth.service';
import { ConnectorModule } from '../connector/connector.module';
import { Connector } from '../connector/connector.interface';
import { ApiConfig } from './api-config.interface';
import { API_CONFIG_TOKEN } from '../common/constants';
import { _ } from 'lodash';
import { AuthGuard } from './auth.guard';

@Module({})
export class ApiModule {
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
    },
  };

  static register(
    config?: Partial<ApiConfig>,
    databaseConnector?: Provider<Connector>,
  ): DynamicModule {;
    const apiConfig = _.merge(ApiModule.defaultConfig, config);
    const connector = ConnectorModule.getConnector(
      apiConfig.db.name,
      databaseConnector,
    );
    return {
      module: ApiModule,
      providers: [
        AuthService,
        AuthGuard,
        { provide: API_CONFIG_TOKEN, useValue: apiConfig },
      ],
      controllers: [ApiController],
      imports: [ConnectorModule.register(connector, apiConfig.db)],
    };
  }
}
