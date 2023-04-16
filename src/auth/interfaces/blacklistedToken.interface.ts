import { IUser } from '../../users/interfaces/user.interface';

export interface IBlacklistedToken {
  tokenId: string;
  user: IUser;
  createdAt: Date;
}
