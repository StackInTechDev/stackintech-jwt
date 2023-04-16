import { IAuthResponseUser } from './authResponseUser.interface';

export interface IAuthResponse {
  user: IAuthResponseUser;
  accessToken: string;
}
