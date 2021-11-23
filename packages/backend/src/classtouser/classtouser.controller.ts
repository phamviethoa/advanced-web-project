import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ClassToUserService } from './classtouser.service';

@Controller('classes')
export class ClassToUserController {
  constructor(private classToUserService: ClassToUserService) {}

  @Get()
  findAll() {
    return this.classToUserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.classToUserService.findOne(id);
  }

  @Post()
  create(@Body() body: any) {
    return this.classToUserService.create(body);
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
