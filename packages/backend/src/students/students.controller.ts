import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Post()
  mappingstudentId(@Body() body){ // body: email, classroomId, studentId
    return this.studentsService.mappingstudentId(body);
  }

  @Get('all/:classroomId')
  findAllStudentandGrade(@Param('classroomId') classroomId: string){
    return this.studentsService.findAllStudentandGrade(classroomId);
  }

  @Get('totalGrade/:classroomId')
  calTotalGrade(@Param('classroomId') classroomId: string){
    return this.studentsService.calTotalGrade(classroomId);
  }

  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  findAll() {
    return this.studentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.studentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateStudentDto: UpdateStudentDto) {
    return this.studentsService.update(+id, updateStudentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.studentsService.remove(+id);
  }
}
