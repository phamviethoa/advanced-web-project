import { ClassDto } from 'types/class.dto';
import { UserDto } from 'types/user.dto';

export type StudentToClassDto = {
  id: string;
  identity: string;
  student?: UserDto;
  class?: ClassDto;
};
