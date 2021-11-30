import { PartialType } from '@nestjs/mapped-types';
import { CreateAssignmentDto } from './create-assignment.dto';

export class UpdateAllAssignmentDto extends PartialType(CreateAssignmentDto) {
  id:string;
  name?: string;
  point?: number;
  order?: number;
}
