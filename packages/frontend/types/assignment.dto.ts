import { GradeDto } from './grade.dto';

export type AssignemtDto = {
  id?: string;
  name: string;
  maxPoint: number;
  grades: GradeDto[];
  isFinalized: boolean;
};
