import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignupUserDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
