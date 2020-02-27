import { Module } from '@nestjs/common';
import { ApiModule } from './api/api.module';

@Module({
  imports: [
    ApiModule.register({
      db: {
        name: 'mongodb',
        url: 'mongodb://127.0.0.1:27017/test',
        // collection: req => 'delete_me',
        collection: 'delete_me2',
        createCollectionNotExisting: true
      },
    }),
  ],
  controllers: [],
  providers: [],
  exports: [],
})
export class NoRestModule {}
