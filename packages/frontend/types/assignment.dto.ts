import { GradeDto } from './grade.dto';

export type AssignemtDto = {
  id?: string;
  name: string;
  maxPoint: number;
  order: number;
  grades: GradeDto[];
  isFinalized: boolean;
};

export type AssignemtDtoInteract = {
  id?: string;
  name: string;
  maxPoint: number;
  order: number;
  grades: {
    id?: string;
    point: number;
  }[];
  isFinalized: boolean;
};

export type UpdateAssignmentDto = {
  id: string;
  name: string;
  maxPoint: number;
}[];
