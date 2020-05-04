import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';

@Module({
  imports: [
    ApiModule.forRoot(),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class NoRestModule {}
