export class UpdateAssignmentDto {
  assignments: {
    id: string
    name: string;
    maxPoint: number;
  }[];
}
