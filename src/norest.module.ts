import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';

@Module({
  imports: [
    ApiModule.register({
      db: {
        name: 'mock',
        url: 'mongodb://127.0.0.1:27017/test',
        // collection: req => 'delete_me',
        collection: 'delete_me',
      },
    }),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class NoRestModule {}
