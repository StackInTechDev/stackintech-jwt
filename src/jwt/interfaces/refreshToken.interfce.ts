import { IEmailPayload } from './emailToken.interface';
import { ITokenBase } from './tokenBase.interface';

export interface IRefreshPayload extends IEmailPayload {
  tokenId: string;
}

export interface IRefreshToken extends IRefreshPayload, ITokenBase {}
