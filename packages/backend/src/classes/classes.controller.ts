import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { Public } from 'src/auth/auth.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';

@Controller('classes')
export class ClassesController {
  constructor(private classesService: ClassesService) {}

  @Get()
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.classesService.findOne(id);
  }

  @Post()
  create(@Body() createClassDto: CreateClassDto) {
    return this.classesService.create(createClassDto);
  }

  @Get('invite-student-link/:id')
  getInviteStudentLink(@Param('id') id: string) {
    return this.classesService.getInviteStudentLink(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/add-student')
  addStudent(
    @Request() req: any,
    @Query('token') token: string,
    @Body('identity') identity: string,
  ) {
    const email = req.user.email;
    return this.classesService.addStudent(email, identity, token);
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
