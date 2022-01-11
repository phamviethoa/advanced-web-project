import { AssignemtDto } from './assignment.dto';
import { StudentInSystemDto } from './student.dto';
import { UserDto } from './user.dto';

export type ClassroomDto = {
  id?: string;
  subject: string;
  description: string;
  teachers: UserDto[];
  students: StudentInSystemDto[];
  assignments: AssignemtDto[];
};

export type CreateClassroomDto = {
  subject: string;
  description: string;
};
