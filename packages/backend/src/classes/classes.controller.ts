import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateClassDTO } from './class.dto';
import { ClassesService } from './classes.service';

@Controller('classes')
export class ClassesController {
    constructor(private classesService: ClassesService) {}

    @Get()
    findAll(){
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
    update(@Param('id') id: number, @Body() body: any) {
    return body;
    }

    @Delete(':id')
    delete(@Param('id') id: number) {
      return true;
    }
}
