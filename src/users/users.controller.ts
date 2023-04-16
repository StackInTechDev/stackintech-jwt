import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ConfigService } from '@nestjs/config';
import { Public } from '../auth/decorators/public.decorator';
import { GetUserParams } from './dtos/getUser.params';
import { ResponseUserMapper } from './mappers/responseUser.mapper';
import { IResponseUser } from './interfaces/responseUser.interface';
import { CurrentUser } from '../auth/decorators/currentUser.decorator';
import { ChangeEmailDto } from './dtos/changeEmail.dto';
import { IAuthResponseUser } from '../auth/interfaces/authResponseUser.interface';
import { AuthResponseUserMapper } from '../auth/mappers/authResponseuser.mapper';
import { UpdateUserDto } from './dtos/updateUser.dto';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { PasswordDto } from './dtos/password.dto';
import { Response } from 'express-serve-static-core';

@Controller('api/users')
export class UsersController {
  private cookiePath = '/api/auth';
  private cookieName: string;

  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService,
  ) {
    this.cookieName = this.configService.get<string>('COOKIE_NAME');
  }
  //   @Public()
  //   @Get('/:idOrUsername')
  //   public async getUser(@Param() params: GetUserParams): Promise<IResponseUser> {
  //     const user = await this.usersService.findOneByIdOrUsername(idOrUsername);
  //     return ResponseUserMapper.map(user);
  //   }

  @Patch('/email')
  public async updateEmail(
    @CurrentUser() id: string,
    @Body() dto: ChangeEmailDto,
  ): Promise<IAuthResponseUser> {
    const user = await this.usersService.updateEmail(id, dto);
    return AuthResponseUserMapper.map(user);
  }

  @Patch()
  public async updateUser(
    @CurrentUser() id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<IResponseUser> {
    const user = await this.usersService.update(id, dto);
    return ResponseUserMapper.map(user);
  }

  @Delete()
  @ApiNoContentResponse({
    description: 'The user is deleted.',
  })
  @ApiBadRequestResponse({
    description: 'Something is invalid on the request body, or wrong password.',
  })
  @ApiUnauthorizedResponse({
    description: 'The user is not logged in.',
  })
  public async deleteUser(
    @CurrentUser() id: string,
    @Body() dto: PasswordDto,
    @Res() res: Response,
  ): Promise<void> {
    await this.usersService.delete(id, dto);
    res
      .clearCookie(this.cookieName, { path: this.cookiePath })
      .status(HttpStatus.NO_CONTENT)
      .send();
  }
}
