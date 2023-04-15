import { ICredentials } from './credentials.interface';

export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  confirmed: boolean;
  credentials?: ICredentials;
  createdAt?: Date;
  updatedAt?: Date;
}
