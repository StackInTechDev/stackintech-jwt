import { IUser } from '../interfaces/user.interface';
import { IResponseUser } from '../interfaces/responseUser.interface';

export class ResponseUserMapper implements IResponseUser {
  public id: string;
  public firstName: string;
  public lastName: string;
  public username: string;
  public createdAt: string;
  public updatedAt: string;

  constructor(values: IResponseUser) {
    Object.assign(this, values);
  }

  public static map(user: IUser): ResponseUserMapper {
    return new ResponseUserMapper({
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      username: user.username,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  }
}
