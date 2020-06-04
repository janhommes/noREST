export interface Query {
  method: string;
  uri: string;
  body?: string;
  options?: {
    useAuthentication?: boolean;
    description?: string;
    title?: string;
    headers?: {
      [key: string]: string;
    };
  };
  execute?: boolean;
}
