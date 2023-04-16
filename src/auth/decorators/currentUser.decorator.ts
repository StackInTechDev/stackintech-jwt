import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express-serve-static-core';

export const CurrentUser = createParamDecorator(
  (_, context: ExecutionContext): string | undefined => {
    return context.switchToHttp().getRequest<Request>()?.user;
  },
);
