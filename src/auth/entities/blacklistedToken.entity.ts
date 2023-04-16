import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  PrimaryColumn,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.untity';
import { IBlacklistedToken } from '../interfaces/blacklistedToken.interface';

@Entity()
export class BlacklistedTokenEntity implements IBlacklistedToken {
  @PrimaryGeneratedColumn('uuid')
  public tokenId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  public user: User;

  @CreateDateColumn()
  public createdAt: Date;
}
