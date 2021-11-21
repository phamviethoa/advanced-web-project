import { IsNotEmpty, IsString } from 'class-validator';

export class SignupUserDto {
  @IsNotEmpty()
  @IsString()
  username: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}
