import { Controller, Get, HttpStatus, Scope } from '@nestjs/common';

@Controller({
  scope: Scope.DEFAULT,
  path: 'health',
})
export class HealthController {
  @Get('')
  async ping() {
    return HttpStatus.OK;
  }
}
