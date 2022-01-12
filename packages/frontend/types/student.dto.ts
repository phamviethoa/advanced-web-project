import { ClassroomDto } from './classroom.dto';
import { GradeDto } from './grade.dto';
import { UserDto } from './user.dto';

export type StudentDto = {
  id?: string;
  identity: string;
  fullName: string;
  classrooms: ClassroomDto[];
  grades: GradeDto[];
  user?: UserDto;
};
