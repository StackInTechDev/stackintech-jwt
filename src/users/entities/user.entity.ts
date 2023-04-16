import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';
import { IUser } from '../interfaces/user.interface';
import { CredentialsEmbeddable } from '../embeddables/credentials.embeddable';

enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  GUEST = 'guest',
}

@Entity()
export class User implements IUser {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;
  @Column()
  username: string;
  @Column()
  email: string;

  @Column()
  password: string;

  @Column({ default: false })
  confirmed: boolean;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.USER })
  role: UserRole;

  @Column(() => CredentialsEmbeddable)
  credentials: CredentialsEmbeddable;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
