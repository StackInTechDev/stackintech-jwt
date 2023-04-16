import { IAuthResponse } from '../interfaces/authResponse.interface';
import { IAuthResult } from '../interfaces/authResult.interface';
import { AuthResponseUserMapper } from './authResponseuser.mapper';

export class AuthResponseMapper implements IAuthResponse {
  public user: AuthResponseUserMapper;
  public accessToken: string;

  constructor(values: IAuthResponse) {
    Object.assign(this, values);
  }

  public static map(result: IAuthResult): AuthResponseMapper {
    return new AuthResponseMapper({
      user: AuthResponseUserMapper.map(result.user),
      accessToken: result.accessToken,
    });
  }
}
