export interface AuthProxyConfig {
  github?: {
    client_id: string;
    redirect_uri: string;
    login: string;
    scope: string;
    state: string;
    allow_signup: 'true' | 'false';
    client_secret: string;
  };
}
