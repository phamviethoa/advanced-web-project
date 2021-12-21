import { Controller, Get, Param } from '@nestjs/common';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentToClassService: StudentsService) {}

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.studentToClassService.findOne(id);
  }
}
