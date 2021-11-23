import { IsNotEmpty, IsString } from 'class-validator';

export class SignupUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
