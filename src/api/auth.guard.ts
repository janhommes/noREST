import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private auth: AuthService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request = context.switchToHttp().getRequest();
    this.auth.authenticate(request);
    // TODO add here role based access control
    if (!request.auth.isAuthenticated) {
      throw new HttpException('Authentication required', HttpStatus.UNAUTHORIZED);
    }
    return request.auth.isAuthenticated;
  }
}
