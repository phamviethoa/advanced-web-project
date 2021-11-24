import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ClassesService } from './classes.service';
import { StudentToClassService } from 'src/student-to-class/student-to-class.service';

@Controller('classes')
export class ClassesController {
  constructor(private classesService: ClassesService,  private studentToClassService: StudentToClassService) {}

  @Get()
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.classesService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.classesService.create(body);
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return body;
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return true;
  }

  @Post('/student-to-class')
  createclasstostudent(@Body()  body: any) {
    return this.studentToClassService.create(body);
  }

  @Get('/student-to-class/:id')
  findAllpartici(@Param('id') id: string) {
    return this.studentToClassService.findAllpartici(id);
  }
}
