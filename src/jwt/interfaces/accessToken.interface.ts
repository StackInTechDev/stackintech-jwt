import { ITokenBase } from './tokenBase.interface';

export interface IAccessPayload {
  id: string;
}

export interface IAccessToken extends IAccessPayload, ITokenBase {}
