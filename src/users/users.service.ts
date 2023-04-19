import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Like, Repository } from 'typeorm';
import { CommonService } from '../common/common.service';
import { IUser } from './interfaces/user.interface';
import { isNull, isUndefined } from '../common/utils/validation.util';
import { UpdateUserDto } from './dtos/updateUser.dto';
import { ChangeEmailDto } from './dtos/changeEmail.dto';
import { compare, hash } from 'bcrypt';
import { PasswordDto } from './dtos/password.dto';
import { isUUID } from 'class-validator';
import { SLUG_REGEX } from '../common/consts/regex.const';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly commonService: CommonService,
  ) {}
  public async create(data: IUser): Promise<User> {
    const formattedEmail = data.email.toLowerCase();
    await this.checkEmailUniqueness(formattedEmail);
    data.firstName = this.commonService.formatName(data.firstName);
    data.lastName = this.commonService.formatName(data.lastName);
    data.username = await this.generateUsername(data.lastName);
    data.password = await hash(data.password, 10);
    const user = this.usersRepository.create(data);
    await this.commonService.saveEntity(this.usersRepository, user, true);
    return user;
  }
  public async confirmEmail(userId: string, version: number): Promise<User> {
    const user = await this.findOneByCredentials(userId, version);

    if (user.confirmed) {
      throw new BadRequestException('Email already confirmed');
    }

    user.confirmed = true;
    user.credentials.updateVersion();
    await this.commonService.saveEntity(this.usersRepository, user);
    return user;
  }
  private async checkEmailUniqueness(email: string): Promise<void> {
    const count = await this.usersRepository.count({
      where: {
        email,
      },
    });
    console.log(count);
    if (count > 0) {
      throw new ConflictException('Email already in use');
    }
  }

  private async generateUsername(name: string): Promise<string> {
    const pointSlug = this.commonService.generatePointSlug(name);
    const count = await this.usersRepository.count({
      where: {
        username: Like(`${pointSlug}%`),
      },
    });

    if (count > 0) {
      return `${pointSlug}${count}`;
    }

    return pointSlug;
  }

  public async findOneById(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    this.commonService.checkEntityExistence(user, 'User');
    return user;
  }

  public async findOneByEmail(email: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });
    this.throwUnauthorizedException(user);
    return user;
  }

  public async uncheckedUserByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({
      where: {
        email: email.toLowerCase(),
      },
    });
  }

  private throwUnauthorizedException(user: undefined | null | User): void {
    if (isUndefined(user) || isNull(user)) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  public async findOneByCredentials(
    id: string,
    version: number,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    this.throwUnauthorizedException(user);

    if (user.credentials.version !== version) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return user;
  }

  public async findOneByUsername(
    username: string,
    forAuth = false,
  ): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: {
        username: username.toLowerCase(),
      },
    });

    if (forAuth) {
      this.throwUnauthorizedException(user);
    } else {
      this.commonService.checkEntityExistence(user, 'User');
    }

    return user;
  }

  public async findOneByIdOrUsername(idOrUsername: string): Promise<User> {
    if (isUUID(idOrUsername)) {
      return this.findOneById(idOrUsername);
    }

    if (
      idOrUsername.length < 3 ||
      idOrUsername.length > 106 ||
      !SLUG_REGEX.test(idOrUsername)
    ) {
      throw new BadRequestException('Invalid username');
    }

    return this.findOneByUsername(idOrUsername);
  }

  public async update(userId: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOneById(userId);
    const { firstName, lastName, username } = dto;

    if (!isUndefined(firstName) && !isNull(firstName)) {
      if (firstName === user.firstName) {
        throw new BadRequestException('Name must be different');
      }

      user.firstName = this.commonService.formatName(firstName);
    }

    if (!isUndefined(lastName) && !isNull(lastName)) {
      if (lastName === user.lastName) {
        throw new BadRequestException('Name must be different');
      }

      user.lastName = this.commonService.formatName(lastName);
    }
    if (!isUndefined(username) && !isNull(username)) {
      const formattedUsername = dto.username.toLowerCase();

      if (user.username === formattedUsername) {
        throw new BadRequestException('Username should be different');
      }

      await this.checkUsernameUniqueness(formattedUsername);
      user.username = formattedUsername;
    }

    await this.commonService.saveEntity(this.usersRepository, user);
    return user;
  }

  private async checkUsernameUniqueness(username: string): Promise<void> {
    const count = await this.usersRepository.count({ where: { username } });

    if (count > 0) {
      throw new ConflictException('Username already in use');
    }
  }

  public async updateEmail(userId: string, dto: ChangeEmailDto): Promise<User> {
    const user = await this.findOneById(userId);
    const { email, password } = dto;

    if (!(await compare(password, user.password))) {
      throw new BadRequestException('Invalid password');
    }

    const formattedEmail = email.toLowerCase();
    await this.checkEmailUniqueness(formattedEmail);
    user.credentials.updateVersion();
    user.email = formattedEmail;
    await this.commonService.saveEntity(this.usersRepository, user);
    return user;
  }

  public async updatePassword(
    userId: string,
    password: string,
    newPassword: string,
  ): Promise<User> {
    const user = await this.findOneById(userId);

    if (!(await compare(password, user.password))) {
      throw new BadRequestException('Wrong password');
    }
    if (await compare(newPassword, user.password)) {
      throw new BadRequestException('New password must be different');
    }

    user.credentials.updatePassword(user.password);
    user.password = await hash(newPassword, 10);
    await this.commonService.saveEntity(this.usersRepository, user);
    return user;
  }

  public async resetPassword(
    userId: string,
    version: number,
    password: string,
  ): Promise<User> {
    const user = await this.findOneByCredentials(userId, version);
    user.credentials.updatePassword(user.password);
    user.password = await hash(password, 10);
    await this.commonService.saveEntity(this.usersRepository, user);
    return user;
  }

  public async delete(userId: string, dto: PasswordDto): Promise<User> {
    const user = await this.findOneById(userId);

    if (!(await compare(dto.password, user.password))) {
      throw new BadRequestException('Wrong password');
    }

    await this.commonService.removeEntity(this.usersRepository, user);
    return user;
  }
}
