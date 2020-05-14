import { Module, DynamicModule } from '@nestjs/common';
import { NoRestConfig } from '../norest-config.interface';
import {
  NOREST_CONFIG_TOKEN,
  NOREST_CONNECTOR_CONFIG_TOKEN,
  NOREST_REST_CONFIG_TOKEN,
  NOREST_AUTH_CONFIG_TOKEN,
  NOREST_WEBSOCKET_CONFIG_TOKEN,
} from '../common/constants';
import { normalizeConfig } from '../common/normalize';

@Module({})
export class ConfigInitializerModule {
  static async register(config?: NoRestConfig): Promise<DynamicModule> {
    const noRestConfig = config || (await normalizeConfig(config));
    return {
      module: ConfigInitializerModule,
      providers: [
        { provide: NOREST_CONFIG_TOKEN, useValue: noRestConfig },
        {
          provide: NOREST_CONNECTOR_CONFIG_TOKEN,
          useValue: noRestConfig.connector,
        },
        { provide: NOREST_REST_CONFIG_TOKEN, useValue: noRestConfig.rest },
        { provide: NOREST_AUTH_CONFIG_TOKEN, useValue: noRestConfig.auth },
        {
          provide: NOREST_WEBSOCKET_CONFIG_TOKEN,
          useValue: noRestConfig.websocket,
        },
      ],
      exports: [
        NOREST_CONFIG_TOKEN,
        NOREST_CONNECTOR_CONFIG_TOKEN,
        NOREST_REST_CONFIG_TOKEN,
        NOREST_AUTH_CONFIG_TOKEN,
        NOREST_WEBSOCKET_CONFIG_TOKEN,
      ],
    };
  }
}
