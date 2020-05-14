import { CallHandler, ExecutionContext, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
export declare class PrivateInterceptor implements NestInterceptor {
    private auth;
    constructor(auth: AuthService);
    intercept(context: ExecutionContext, next: CallHandler): Observable<any>;
    omit(value: any): any;
}
