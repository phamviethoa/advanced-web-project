import { IsNotEmpty, IsString } from 'class-validator';

export class CreateClassDto {
  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}
