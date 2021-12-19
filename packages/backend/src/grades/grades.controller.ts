import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { GradesService } from './grades.service';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { read } from 'xlsx';

@Controller('grades')
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get('downloadtempaltegrade')
  download(@Res() res){
    const filename = "templategrade.xlsx";
    return res.download('./src/grades/filetemplategrade/' + filename);
  }

  @Post('uploadassasignmentgrade')
  @UseInterceptors(FileInterceptor('file'))
  uploatFile(@UploadedFile() file, @Body() body){
    const workBook= read(file.buffer);
    const workSheet=workBook.Sheets[workBook.SheetNames[0]];
    this.gradesService.saveAssignmentGrade(workSheet, body)
  }

  @Post('inputgrade')
  inputgrade1student1assignment(@Body() body){ //body grade, assignmentId, studentId, classroomId
    return this.gradesService.inputgrade1student1assignment(body);
  }

  @Post()
  create(@Body() createGradeDto: CreateGradeDto) {
    return this.gradesService.create(createGradeDto);
  }

  @Get()
  findAll() {
    return this.gradesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gradesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGradeDto: UpdateGradeDto) {
    return this.gradesService.update(+id, updateGradeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gradesService.remove(+id);
  }
}
