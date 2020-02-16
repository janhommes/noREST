import { DbConfig } from '../connector/db-config.interface';

export interface ApiConfig {
  db: DbConfig;
  config: {
    auth: {
      cookieName: string;
      jwtValidation: boolean;
      mode: string;
      secret: string;
      userProperty: string;
    };
    baseRoute: string;
    fixed: boolean;
  };
}
