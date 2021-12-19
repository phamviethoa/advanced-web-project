import { Controller, Get, Post, Body, Patch, Param, Delete, Res, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { createWriteStream } from 'fs';
import { ClassroomsService } from './classrooms.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { read } from 'xlsx';

@Controller('classrooms')
export class ClassroomsController {
  constructor(private readonly classroomsService: ClassroomsService) {}

  @Post('/assignement/isfull/:assigenmentId')
  isFullAssignment( @Body() body){
    return this.classroomsService.isFullAssignment( body)
  }

  @Get('downloadtemplatestudentlist')
  download(@Res() res){
    const filename = "templatestudentlist.xlsx";
    return res.download('./src/classrooms/filetemplatestudentlist/' + filename);
  }

  @Post('uploadliststudent')
  @UseInterceptors(FileInterceptor('file'))
  uploatFile(@UploadedFile() file, @Body() body){
    const workBook= read(file.buffer);
    const workSheet=workBook.Sheets[workBook.SheetNames[0]];
    return this.classroomsService.savestudentlist(workSheet, body)
  }


  @Post()
  create(@Body() createClassroomDto: CreateClassroomDto) {
    return this.classroomsService.create(createClassroomDto);
  }

  @Get()
  findAll() {
    return this.classroomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classroomsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateClassroomDto: UpdateClassroomDto) {
    return this.classroomsService.update(+id, updateClassroomDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.classroomsService.remove(+id);
  }
}
