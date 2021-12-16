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
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ClassesService } from './classes.service';
import { CreateClassDto } from './dto/create-class.dto';
import { StudentToClassService } from 'src/student-to-class/student-to-class.service';
import { UpdateAssignmentDto } from 'src/classes/dto/update-assignments.dto';
import { Roles } from 'src/auth/author/role.decorator';
import { Role } from 'src/auth/author/entities/role.enum';
import { RolesGuard } from 'src/auth/author/role.guard';

@Controller('classes')
export class ClassesController {
  constructor(
    private classesService: ClassesService,
    private studentToClassService: StudentToClassService,
  ) {}

  @Get()
  findAll() {
    return this.classesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: number) {
    return this.classesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() createClassDto: CreateClassDto) {
    const teacherId = req.user.id;
    return this.classesService.create(createClassDto, teacherId);
  }

  @Get('/user/:id')
  async findAllwithstudentteacher(@Param('id') id: string) {
    const classesstudent= await this.classesService.findAllwithstudent(id);
    const classesteacher =await this.classesService.findAllwithteacher(id);
    let classuser=[];
    for(const classstudent of classesstudent)
    {
      classuser.push(classstudent);
    }

    for(const classteacher of classesteacher)
    {
      classuser.push(classteacher);
    }
    return classuser;
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

  @Post('/student-to-class')
  createclasstostudent(@Body() body: any) {
    return this.studentToClassService.create(body);
  }

  @Get('/student-to-class/:id')
  findAllpartici(@Param('id') id: string) {
    return this.studentToClassService.findAllpartici(id);
  }

  @Post('/update-assignments/:id')
  @Roles(Role.TEACHER)
  @UseGuards(JwtAuthGuard, RolesGuard)
  updateAssignments(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    return this.classesService.updateAssignments(id, updateAssignmentDto);
  }
}
