import { ClassroomDto } from './classroom.dto';
import { StudentDto } from './student.dto';

export type UserDto = {
  id?: string;
  email: string;
  fullName: string;
  password: string;
  classrooms: ClassroomDto[];
  students: StudentDto[];
};
