export interface AuthConfig {
  cookieName: string;
  userProperty: string;
  enabled: boolean;
  jwt?: {
    verify: boolean;
    secretOrPublicKey: string;
    secretOrPrivateKey: string;
    /**
     * Passed to the JWT options of (jsonwebtoken)[https://www.npmjs.com/package/jsonwebtoken]
     */
    options?: any;
  };
}
