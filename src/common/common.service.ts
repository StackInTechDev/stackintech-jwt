import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  LoggerService,
  NotFoundException,
} from '@nestjs/common';
import { validate } from 'class-validator';
import { ObjectLiteral, EntityManager, QueryRunner, Repository } from 'typeorm';
import { isNull, isUndefined } from './utils/validation.util';
import slugify from 'slugify';
import { v4 } from 'uuid';
import { IMessage } from './interfaces/message.interface';

@Injectable()
export class CommonService {
  private readonly loggerService: LoggerService;
  constructor() {
    this.loggerService = new Logger(CommonService.name);
  }

  public async validateEntity(entity: ObjectLiteral): Promise<void> {
    const errors = await validate(entity);
    const messages: string[] = [];

    for (const error of errors) {
      messages.push(...Object.values(error.constraints));
    }

    if (errors.length > 0) {
      throw new BadRequestException(messages.join(',\n'));
    }
  }

  public async throwDuplicateError<T>(promise: Promise<T>, message?: string) {
    try {
      return await promise;
    } catch (error) {
      this.loggerService.error(error);

      if (error.code === '23505') {
        throw new ConflictException(message ?? 'Duplicated value in database');
      }

      throw new BadRequestException(error.message);
    }
  }
  public async throwInternalError<T>(promise: Promise<T>): Promise<T> {
    try {
      return await promise;
    } catch (error) {
      this.loggerService.error(error);
      throw new InternalServerErrorException(error);
    }
  }

  public checkEntityExistence<T extends ObjectLiteral>(
    entity: T | null | undefined,
    name: string,
  ): void {
    if (isNull(entity) || isUndefined(entity)) {
      throw new NotFoundException(`${name} not found`);
    }
  }

  public async saveEntity<T extends ObjectLiteral>(
    manager: Repository<T>,
    entity: T,
    isNew = false,
  ): Promise<void> {
    await this.validateEntity(entity);

    if (isNew) {
      await manager.save(entity);
    }
    await this.throwDuplicateError(manager.save(entity));
  }

  public async removeEntity<T extends ObjectLiteral>(
    manager: Repository<T>,
    entity: T,
  ): Promise<void> {
    await this.throwInternalError(manager.remove(entity));
  }

  public formatName(title: string): string {
    return title
      .trim()
      .replace(/\n/g, ' ')
      .replace(/\s\s+/g, ' ')
      .replace(/\w\S*/g, (w) => w.replace(/^\w/, (l) => l.toUpperCase()));
  }
  public generatePointSlug(str: string): string {
    return slugify(str, { lower: true, replacement: '.', remove: /['_\.\-]/g });
  }

  public generateMessage(message: string): IMessage {
    return { id: v4(), message };
  }
}
