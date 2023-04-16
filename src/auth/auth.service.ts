import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BlacklistedTokenEntity } from './entities/blacklistedToken.entity';
import { Repository } from 'typeorm';
import { CommonService } from '../common/common.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '../jwt/jwt.service';
import { User } from '../users/entities/user.untity';
import { TokenTypeEnum } from '../jwt/enums/token.enum';
import { SignUpDto } from './dtos/signup.dto';
import { IMessage } from '../common/interfaces/message.interface';
import { IUser } from '../users/interfaces/user.interface';
import { IAuthResult } from './interfaces/authResult.interface';
import { compare } from 'bcrypt';
import { isEmail } from 'class-validator';
import { SLUG_REGEX } from '../common/consts/regex.const';
import { ICredentials } from '../users/interfaces/credentials.interface';
import dayjs from 'dayjs';
import { IRefreshToken } from '../jwt/interfaces/refreshToken.interfce';
import { SignInDto } from './dtos/signin.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(BlacklistedTokenEntity)
    private readonly blacklistedTokensRepository: Repository<BlacklistedTokenEntity>,
    private readonly userRepository: Repository<User>,
    private readonly commonService: CommonService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async generateAuthTokens(
    user: User,
    domain?: string,
    tokenId?: string,
  ): Promise<[string, string]> {
    return Promise.all([
      this.jwtService.generateToken(
        user,
        TokenTypeEnum.ACCESS,
        domain,
        tokenId,
      ),
      this.jwtService.generateToken(
        user,
        TokenTypeEnum.REFRESH,
        domain,
        tokenId,
      ),
    ]);
  }

  public async signUp(dto: SignUpDto, domain?: string): Promise<IMessage> {
    const { firstName, lastName, email, password1, password2 } = dto;
    this.comparePasswords(password1, password2);
    const data: IUser = {
      firstName,
      lastName,
      email,
      password: password1,
    };
    const user = await this.usersService.create(data);
    const confirmationToken = await this.jwtService.generateToken(
      user,
      TokenTypeEnum.CONFIRMATION,
      domain,
    );
    // this.mailerService.sendConfirmationEmail(user, confirmationToken);
    return this.commonService.generateMessage('Registration successful');
  }

  private comparePasswords(password1: string, password2: string): void {
    if (password1 !== password2) {
      throw new BadRequestException('Passwords do not match');
    }
  }

  public async singIn(dto: SignInDto, domain?: string): Promise<IAuthResult> {
    const { emailOrUsername, password } = dto;
    const user = await this.userByEmailOrUsername(emailOrUsername);

    if (!(await compare(password, user.password))) {
      await this.checkLastPassword(user.credentials, password);
    }
    if (!user.confirmed) {
      const confirmationToken = await this.jwtService.generateToken(
        user,
        TokenTypeEnum.CONFIRMATION,
        domain,
      );
      //this.mailerService.sendConfirmationEmail(user, confirmationToken);
      throw new UnauthorizedException(
        'Please confirm your email, a new email has been sent',
      );
    }

    const [accessToken, refreshToken] = await this.generateAuthTokens(
      user,
      domain,
    );
    return { user, accessToken, refreshToken };
  }

  // validates the input and fetches the user by email or username
  private async userByEmailOrUsername(emailOrUsername: string): Promise<User> {
    if (emailOrUsername.includes('@')) {
      if (!isEmail(emailOrUsername)) {
        throw new BadRequestException('Invalid email');
      }

      return this.usersService.findOneByEmail(emailOrUsername);
    }

    if (
      emailOrUsername.length < 3 ||
      emailOrUsername.length > 106 ||
      !SLUG_REGEX.test(emailOrUsername)
    ) {
      throw new BadRequestException('Invalid username');
    }

    return this.usersService.findOneByUsername(emailOrUsername, true);
  }

  // checks if your using your last password
  private async checkLastPassword(
    credentials: ICredentials,
    password: string,
  ): Promise<void> {
    const { lastPassword, passwordUpdatedAt } = credentials;

    if (lastPassword.length === 0 || !(await compare(password, lastPassword))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const now = dayjs();
    const time = dayjs.unix(passwordUpdatedAt);
    const months = now.diff(time, 'month');
    const message = 'You changed your password ';

    if (months > 0) {
      throw new UnauthorizedException(
        message + months + (months > 1 ? ' months ago' : ' month ago'),
      );
    }

    const days = now.diff(time, 'day');

    if (days > 0) {
      throw new UnauthorizedException(
        message + days + (days > 1 ? ' days ago' : ' day ago'),
      );
    }

    const hours = now.diff(time, 'hour');

    if (hours > 0) {
      throw new UnauthorizedException(
        message + hours + (hours > 1 ? ' hours ago' : ' hour ago'),
      );
    }

    throw new UnauthorizedException(message + 'recently');
  }

  public async refreshTokenAccess(
    refreshToken: string,
    domain?: string,
  ): Promise<IAuthResult> {
    const { id, version, tokenId } =
      await this.jwtService.verifyToken<IRefreshToken>(
        refreshToken,
        TokenTypeEnum.REFRESH,
      );
    await this.checkIfTokenIsBlacklisted(id, tokenId);
    const user = await this.usersService.findOneByCredentials(id, version);
    const [accessToken, newRefreshToken] = await this.generateAuthTokens(
      user,
      domain,
      tokenId,
    );
    return { user, accessToken, refreshToken: newRefreshToken };
  }

  // checks if a token given the ID of the user and ID of token exists on the database
  private async checkIfTokenIsBlacklisted(
    userId: string,
    tokenId: string,
  ): Promise<void> {
    const count = await this.blacklistedTokensRepository.count({
      where: {
        user: {
          id: userId,
        },
        tokenId,
      },
    });

    if (count > 0) {
      throw new UnauthorizedException('Token is invalid');
    }
  }

  public async logout(refreshToken: string): Promise<IMessage> {
    const { id, tokenId } = await this.jwtService.verifyToken<IRefreshToken>(
      refreshToken,
      TokenTypeEnum.REFRESH,
    );
    await this.blacklistToken(id, tokenId);
    return this.commonService.generateMessage('Logout successful');
  }

  // creates a new blacklisted token in the database with the
  // ID of the refresh token that was removed with the logout
  private async blacklistToken(userId: string, tokenId: string): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    const blacklistedToken = this.blacklistedTokensRepository.create({
      user,
      tokenId,
    });
    await this.commonService.saveEntity(
      this.blacklistedTokensRepository,
      blacklistedToken,
      true,
    );
  }
}
