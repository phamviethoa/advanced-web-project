import { AssignemtDto } from './assignment.dto';
import { StudentDto } from './student.dto';
import { UserDto } from './user.dto';

export type ClassroomDto = {
  id?: string;
  subject: string;
  description: string;
  teachers: UserDto[];
  students: StudentDto[];
  assignments: AssignemtDto[];
};

export type CreateClassroomDto = {
  subject: string;
  description: string;
};
