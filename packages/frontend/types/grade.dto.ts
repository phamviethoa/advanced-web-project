import { StudentDto } from './student.dto';

export type GradeDto = {
  point: number;
  student: StudentDto;
};
