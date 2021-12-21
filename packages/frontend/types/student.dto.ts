import { UserDto } from './user.dto';

export type StudentDto = {
  id?: string;
  identity: string;
  fullName: string;
};

export type StudentInSystemDto = {
  id?: string;
  identity: string;
  fullName: string;
  user: UserDto;
};
