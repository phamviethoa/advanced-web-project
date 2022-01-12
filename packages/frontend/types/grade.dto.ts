import { AssignemtDto } from './assignment.dto';
import { StudentDto } from './student.dto';

export type GradeDto = {
  id?: string;
  point: number;
  assignment: AssignemtDto;
  student: StudentDto;
  isFinalized: boolean;
};

export type UpdateGradeDto = {
  studentId: string;
  point: number;
  assignmentId: string;
};
