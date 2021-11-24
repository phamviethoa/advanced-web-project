import { StudentToClassDto } from 'types/student-to-class.dto';
import { UserDto } from 'types/user.dto';

export type ClassDto = {
  id: string;
  subject: string;
  description: string;
  teachers?: UserDto[];
  studentToClass?: StudentToClassDto[];
};
