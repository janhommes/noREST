import { ExecutionContext } from "@nestjs/common";

export interface RestConfig {
  defaultPageSize: number;
  request?: ((req: ExecutionContext) => void);
  response?: ((req: ExecutionContext, data: any) => any);
};