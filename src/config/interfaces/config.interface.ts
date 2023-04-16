import { IEmailConfig } from './emailConfig.interface';
import { IJwt } from './jwt.interface';
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from '@nestjs/typeorm';

export interface IConfig {
  id: string;
  port: number;
  domain: string;
  jwt: IJwt;
  db: TypeOrmModuleAsyncOptions;
  emailService: IEmailConfig;
}
