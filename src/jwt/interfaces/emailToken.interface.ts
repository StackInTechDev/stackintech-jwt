import { IAccessPayload } from './accessToken.interface';
import { ITokenBase } from './tokenBase.interface';

export interface IEmailPayload extends IAccessPayload {
  version: number;
}

export interface IEmailToken extends IEmailPayload, ITokenBase {}
