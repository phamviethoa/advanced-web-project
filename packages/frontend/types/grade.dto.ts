import { UserDto } from './user.dto';

export type GradeDto = {
  id?: string;
  point: number;
  //assignment: AssignemtDto;
  //student: StudentDto;
  review: GradeReviewDto;
};

export type UpdateGradeDto = {
  studentId: string;
  point: number;
  assignmentId: string;
};

export type GradeReviewDto = {
  id: string;
  expectation: number;
  explanation: string;
  status: ReviewStatus;
  comments: GradeCommentDto[];
};

export type GradeCommentDto = {
  message: string;
  review: GradeReviewDto;
  teacher: UserDto;
};

export enum ReviewStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
}
