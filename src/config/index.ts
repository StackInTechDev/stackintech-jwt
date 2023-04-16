import { readFileSync } from 'fs';
import { join } from 'path';
import { IConfig } from './interfaces/config.interface';
import { typeOrmConfigAsync } from '../../typeorm.config';

export function config(): IConfig {
  //   const publicKey = readFileSync(
  //     join(__dirname, '..', '..', 'keys/public.key'),
  //     'utf-8',
  //   );
  //   const privateKey = readFileSync(
  //     join(__dirname, '..', '..', 'keys/private.key'),
  //     'utf-8',
  //   );

  return {
    id: process.env.APP_ID,
    port: parseInt(process.env.PORT, 10),
    domain: process.env.DOMAIN,
    jwt: {
      access: {
        secret: process.env.JWT_SECRET,
        time: parseInt(process.env.JWT_ACCESS_TIME, 10),
      },
      emailConfirmation: {
        secret: process.env.JWT_CONFIRMATION_SECRET,
        time: parseInt(process.env.JWT_CONFIRMATION_TIME, 10),
      },
      resetPassword: {
        secret: process.env.JWT_RESET_PASSWORD_SECRET,
        time: parseInt(process.env.JWT_RESET_PASSWORD_TIME, 10),
      },
      refresh: {
        secret: process.env.JWT_REFRESH_SECRET,
        time: parseInt(process.env.JWT_REFRESH_TIME, 10),
      },
    },
    db: typeOrmConfigAsync,
  };
}
