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
  Response,
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateAssignmentDto } from 'src/classes/dto/update-assignments.dto';
import { Roles } from 'src/auth/author/role.decorator';
import { Role } from 'src/auth/author/entities/role.enum';
import { RolesGuard } from 'src/auth/author/role.guard';
import { ClassroomsService } from './classrooms.service';
import { StudentsService } from 'src/students/students.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { read } from 'xlsx';
import { UpdateGradeDTO } from './dto/update-grade-dto';

@Controller('classes')
export class ClassroomsController {
  constructor(
    private classroomsService: ClassroomsService,
    private studentsService: StudentsService,
  ) {}

  @Get(":classroomId/exprot-grade-board")
  exprotgradeboard(@Param('classroomId') classroomId: string, @Res() res: any){
    return this.classroomsService.exprotgradeboard(classroomId, res)
  }

  @Post("/input-grade-student-assignment")
  inputGradeStudentAssignment( @Body() body: UpdateGradeDTO){
    return this.classroomsService.inputGradeStudentAssignment(body);
  }

  @Get(':classroomId/show-students-list-grades')
  showstudents(@Param('classroomId') classroomId){
    return this.classroomsService.showstudentsgrades(classroomId)
  }

  @Post('/assignments/:assignmentId/mark-finalized')
  isFullAssignment(@Param('assignmentId') assignmentId) {
    return this.classroomsService.markFinalized(assignmentId);
  }

  @Get('download-student-list-template')
  downloadstudentlist(@Res() res: any) {
    return this.classroomsService.downloadStudentListTemplate(res);
  }

  @Post(':classroomId/upload-list-student')
  @UseInterceptors(FileInterceptor('file'))
  uploatFilestudentlist(@UploadedFile() file: any, @Param('classroomId') classroomId: string) {
    const workBook = read(file.buffer);
    const workSheet = workBook.Sheets[workBook.SheetNames[0]];
    return this.classroomsService.savestudentlist(workSheet, classroomId);
  }

  @Get('/download-tempalte-grade')
  download(@Res() res){
    const filename = "templategrade.xlsx";
    return res.download('./src/classes/template/' + filename);
  }

  @Post('/upload-assasignment-grade/:assignmentId')
  @UseInterceptors(FileInterceptor('file'))
  uploatFile(@UploadedFile() file, @Param('assignmentId') assignmentId: string){
    const workBook= read(file.buffer);
    const workSheet=workBook.Sheets[workBook.SheetNames[0]];
    return this.classroomsService.saveAssignmentGrade(workSheet, assignmentId)
  }



  @Get()
  findAll() {
    return this.classroomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.classroomsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() createClassDto: CreateClassDto) {
    const teacherId = req.user.id;
    return this.classroomsService.create(createClassDto, teacherId);
  }

  @Get('invite-student-link/:id')
  getInviteStudentLink(@Param('id') id: string) {
    return this.classroomsService.getInviteStudentLink(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/add-student')
  addStudent(
    @Request() req: any,
    @Query('token') token: string,
    @Body('identity') identity: string,
  ) {
    const email = req.user.email;
    return this.classroomsService.addStudent(email, identity, token);
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
    return this.studentsService.create(body);
  }

  @Get('/student-to-class/:id')
  findAllpartici(@Param('id') id: string) {
    return this.studentsService.findAllpartici(id);
  }

  @Post('/update-assignments/:id')
  //@Roles(Role.TEACHER)
  //@UseGuards(JwtAuthGuard, RolesGuard)
  updateAssignments(
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    return this.classroomsService.updateAssignments(id, updateAssignmentDto);
  }
}
