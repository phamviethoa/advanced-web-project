export class UpdateAssignmentDto {
  assignments: {
    name: string;
    maxPoint: number;
    order: number;
  }[];
}
