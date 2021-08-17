import { Inject } from "@nestjs/common";
import { Args, Context, GraphQLExecutionContext, Query, Resolver } from "@nestjs/graphql";
import { Request } from 'express';
import { NOREST_CONFIG_TOKEN } from "../common/constants";
import {
  ConnectorFactory,
  ConnectorRequest
} from '../connector/connector.interface';
import { ConnectorService } from "../connector/connector.service";
import { NoRestConfig } from "../norest-config.interface";

@Resolver('Author')
export class ResolverService {
  private connectorFactory: ConnectorFactory;

  constructor(
    connector: ConnectorService,
    @Inject(NOREST_CONFIG_TOKEN) private config: NoRestConfig,
  ) {
    this.connectorFactory = connector.connectorFactory;
  }

  @Query('author')
  async getAuthor(@Args('id') id: string, @Context() ctx: GraphQLExecutionContext) {
    // https://stackoverflow.com/questions/55269777/nestjs-get-current-user-in-graphql-resolver-authenticated-with-jwt
    // Another approach is to validate web token with whatever package you are using, then create decorator get-user.decorator.ts
    const db = await this.getDatabase(ctx);
    return db.read(id);
  }

  /*@ResolveField('posts')
  async getPosts(@Parent() author) {
    const { id } = author;
    return this..findAll({ authorId: id });
  }*/

  private async getDatabase(ctx) {
    
    const req = ctx.req as Request;
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`
    const connectorReq = {
      url: fullUrl,
      headers: req.headers
    } as ConnectorRequest;

    const connector = await this.connectorFactory.resolveConnector(
      connectorReq,
      this.config.connector,
    );
    return connector;
  }
}