import { IsEmail, IsString, Length, MinLength } from 'class-validator';

export abstract class ChangeEmailDto {
  @IsString()
  @MinLength(1)
  public password!: string;

  @IsString()
  @IsEmail()
  @Length(5, 255)
  public email: string;
}
