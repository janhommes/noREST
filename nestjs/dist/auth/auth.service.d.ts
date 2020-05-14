import { Request } from 'express';
import { AuthConfig } from './auth-config.interface';
export declare type AuthenticatedRequest = Request & {
    auth?: any;
};
export declare class AuthService {
    private authConfig;
    isAuthenticated: boolean;
    user: string;
    constructor(authConfig: AuthConfig);
    authenticate(request: AuthenticatedRequest): void;
    getJwt(headers: any): any;
    getUserFromJwt(jwt: any): any;
    private getCookieByName;
    private getJwtContent;
}
