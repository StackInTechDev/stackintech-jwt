import { Column } from 'typeorm';
import dayjs from 'dayjs';
import { ICredentials } from '../interfaces/credentials.interface';

export class CredentialsEmbeddable implements ICredentials {
  @Column({ type: 'int', default: 0 })
  public version = 0;

  @Column({ type: 'varchar', default: '' })
  public lastPassword = '';

  @Column({ default: dayjs().unix() })
  public passwordUpdatedAt: number = dayjs().unix();

  @Column({ default: dayjs().unix() })
  public updatedAt: number = dayjs().unix();

  public updatePassword(password: string): void {
    this.version++;
    this.lastPassword = password;
    const now = dayjs().unix();
    this.passwordUpdatedAt = now;
    this.updatedAt = now;
  }

  public updateVersion(): void {
    this.version++;
    this.updatedAt = dayjs().unix();
  }
}
