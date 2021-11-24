import { Controller, Get, Param } from '@nestjs/common';
import { StudentToClassService } from './student-to-class.service';

@Controller('student-to-class')
export class StudentToClassController {
  constructor(private readonly studentToClassService: StudentToClassService) {}

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.studentToClassService.findOne(id);
  }
}
