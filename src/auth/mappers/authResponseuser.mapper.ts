import { IUser } from '../../users/interfaces/user.interface';
import { IAuthResponseUser } from '../interfaces/authResponseUser.interface';

export class AuthResponseUserMapper implements IAuthResponseUser {
  public id: string;
  public firstName: string;
  public lastName: string;
  public username: string;
  public email: string;
  public createdAt: string;
  public updatedAt: string;

  constructor(values: IAuthResponseUser) {
    Object.assign(this, values);
  }

  public static map(user: IUser): AuthResponseUserMapper {
    return new AuthResponseUserMapper({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      email: user.email,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  }
}
