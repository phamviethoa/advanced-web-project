import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ClassToUserService } from 'src/classtouser/classtouser.service';
import { ClassesService } from './classes.service';

@Controller('classes')
export class ClassesController {
  constructor(
    private classesService: ClassesService,
    private classToUserService: ClassToUserService,
  ) {}

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
}
