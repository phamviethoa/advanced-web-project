import { StudentDto } from './student.dto';

export type GradeDto = {
  point: number;
  student: StudentDto;
};

export type UpdateGradeDto = {
  studentId: string;
  point: number;
  assignmentId: string;
};
