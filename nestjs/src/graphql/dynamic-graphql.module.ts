import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import { ConfigModule } from '../config/config.module';
import { ConnectorModule } from '../connector/connector.module';
import { ResolverService } from './resolver.service';

@Module({
  imports: [
    ConfigModule,
    ConnectorModule,
    GraphQLModule.forRoot({
      typeDefs: `
      type Author {
        id: String!
        firstName: String
        lastName: String
      }
      
      type Query {
        author(id: String!): Author
      }
      
  `,
    }),
  ],
  providers: [ResolverService],
})
export class DynamicGraphQlModule {}
