import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from '@nestjs/common';


@Injectable()
export class AuthGuard implements CanActivate {
  constructor() {
    console.log('here?! 2.3');
  }

  canActivate(context: ExecutionContext) {
    console.log('new guard called!');
    return true;
  }
}
