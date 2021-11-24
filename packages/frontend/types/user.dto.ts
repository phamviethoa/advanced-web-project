import { ClassDto } from 'types/class.dto';
import { StudentToClassDto } from 'types/student-to-class.dto';

export type UserDto = {
  id: string;
  email: string;
  password: string;
  fullName: string;
  hostedClasses?: ClassDto[];
  studentToClass?: StudentToClassDto[];
  identity?: string;
};
