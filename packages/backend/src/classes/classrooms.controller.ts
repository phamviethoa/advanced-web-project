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
  Res,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateAssignmentDto } from 'src/classes/dto/update-assignments.dto';
import { ClassroomsService } from './classrooms.service';
import { StudentsService } from 'src/students/students.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { read } from 'xlsx';
import { UpdateGradeDTO } from './dto/update-grade-dto';
import { InviteByEmailDTO } from './dto/invite-by-email-dto';
import { CloseReviewDto } from './dto/close-review.dto';

@Controller('classes')
export class ClassroomsController {
  constructor(
    private classroomsService: ClassroomsService,
    private studentsService: StudentsService,
  ) {}

  // YES
  @Get('/managed')
  @UseGuards(JwtAuthGuard)
  getManagedClassrooms(@Request() req: any) {
    const userId = req.user.id;
    return this.classroomsService.getManagedClassrooms(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':classroomId/export-grade-board')
  exprotgradeboard(
    @Param('classroomId') classroomId: string,
    @Res() res: any,
    @Request() req: any,
  ) {
    const userId: string = req.user.id;
    return this.classroomsService.exportGradeBoard(userId, classroomId, res);
  }

  // OK
  @UseGuards(JwtAuthGuard)
  @Post('/input-grade-student-assignment')
  inputGradeStudentAssignment(
    @Body() body: UpdateGradeDTO,
    @Request() req: any,
  ) {
    const userId = req.user.id;
    return this.classroomsService.inputGradeStudentAssignment(userId, body);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':classroomId/show-students-list-grades')
  showstudents(@Param('classroomId') classroomId, @Request() req: any) {
    const userId: string = req.user.id;
    return this.classroomsService.showstudentsgrades(userId, classroomId);
  }

  // OK
  @UseGuards(JwtAuthGuard)
  @Post('/assignments/:assignmentId/mark-finalized')
  isFullAssignment(@Param('assignmentId') assignmentId, @Request() req: any) {
    const teacherId = req.user.id;
    return this.classroomsService.markFinalized(assignmentId, teacherId);
  }

  // OK
  @Get('download-student-list-template')
  downloadstudentlist(@Request() req: any, @Res() res: any) {
    return this.classroomsService.downloadStudentListTemplate(res);
  }

  // OK
  @UseGuards(JwtAuthGuard)
  @Post(':classroomId/upload-list-student')
  @UseInterceptors(FileInterceptor('file'))
  uploatFilestudentlist(
    @Request() req: any,
    @UploadedFile() file: any,
    @Param('classroomId') classroomId: string,
  ) {
    const userId = req.user.id;
    const workBook = read(file.buffer);
    const workSheet = workBook.Sheets[workBook.SheetNames[0]];
    return this.classroomsService.savestudentlist(
      userId,
      workSheet,
      classroomId,
    );
  }

  @Get('/download-template-grade')
  download(@Res() res) {
    const filename = 'templategrade.xlsx';
    return res.download('./src/classes/template/' + filename);
  }

  // OK
  @UseGuards(JwtAuthGuard)
  @Post('/upload-assignment-grades/:assignmentId')
  @UseInterceptors(FileInterceptor('file'))
  uploatFile(
    @Request() req: any,
    @UploadedFile() file: any,
    @Param('assignmentId') assignmentId: string,
  ) {
    const userId = req.user.id;
    const workBook = read(file.buffer);
    const workSheet = workBook.Sheets[workBook.SheetNames[0]];
    return this.classroomsService.saveAssignmentGrade(
      userId,
      workSheet,
      assignmentId,
    );
  }

  // HERE
  //@UseGuards(JwtAuthGuard)
  //@Get()
  //findAll() {
  //return this.classroomsService.findAll();
  //}

  // OK
  @UseGuards(JwtAuthGuard)
  @Get('/owned')
  findAllClassIsTeacher(@Request() req: any) {
    const userid: string = req.user.id;
    return this.classroomsService.findAllClassIsTeacher(userid);
  }

  // OK
  @UseGuards(JwtAuthGuard)
  @Get('/joined')
  findAllClassIsStudent(@Request() req: any) {
    const userid: string = req.user.id;
    return this.classroomsService.findAllClassIsStudent(userid);
  }

  // OK
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.classroomsService.findOne(userId, id);
  }

  // OK
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Request() req: any, @Body() createClassDto: CreateClassDto) {
    const teacherId = req.user.id;
    return this.classroomsService.create(createClassDto, teacherId);
  }

  // OK
  @UseGuards(JwtAuthGuard)
  @Get('invite-student-link/:id')
  getInviteStudentLink(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.classroomsService.getInviteStudentLink(userId, id);
  }

  // OK
  @UseGuards(JwtAuthGuard)
  @Get('/invite-teacher-link/:classroomId')
  getInviteTeacherLink(
    @Request() req: any,
    @Param('classroomId') classroomId: string,
  ) {
    const userId = req.user.id;
    return this.classroomsService.getInviteTeacherLink(userId, classroomId);
  }

  // OK
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

  // OK
  @UseGuards(JwtAuthGuard)
  @Post('/add-teacher')
  addTeacher(@Request() req: any, @Query('token') token: string) {
    const email = req.user.email;
    return this.classroomsService.addTeacher(email, token);
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

  // OK
  @Post('/update-assignments/:id')
  @UseGuards(JwtAuthGuard)
  updateAssignments(
    @Request() req: any,
    @Param('id') id: string,
    @Body() updateAssignmentDto: UpdateAssignmentDto,
  ) {
    const userId = req.user.id;
    return this.classroomsService.updateAssignments(userId, id, updateAssignmentDto);
  }

  // OK
  @UseGuards(JwtAuthGuard)
  @Post('/invite-student-by-email/:classroomId')
  inviteStudentByEmail(
    @Request() req: any,
    @Param('classroomId') classroomId: string,
    @Body() body: InviteByEmailDTO,
  ) {
    const userId = req.user.id;
    return this.classroomsService.inviteStudentByEmail(
      classroomId,
      body,
      userId,
    );
  }

  // OK
  @UseGuards(JwtAuthGuard)
  @Post('/invite-teacher-by-email/:classroomId')
  inviteTeacherByEmail(
    @Request() req: any,
    @Param('classroomId') classroomId: string,
    @Body() body: InviteByEmailDTO,
  ) {
    const userId = req.user.id;
    return this.classroomsService.inviteTeacherByEmail(
      classroomId,
      body,
      userId,
    );
  }

  // OK
  @UseGuards(JwtAuthGuard)
  @Get('/:classroomId/reviews')
  getReviews(@Request() req: any, @Param('classroomId') classroomId: string) {
    const userId = req.user.id;
    return this.classroomsService.getReviews(userId, classroomId);
  }

  // OK
  @UseGuards(JwtAuthGuard)
  @Get('/:classroomId/review/:reviewId')
  getReview(
    @Request() req: any,
    @Param('reviewId') reviewId: string,
    @Param('classroomId') classroomId: string,
  ) {
    const userId = req.user.id;
    return this.classroomsService.getReview(userId, classroomId, reviewId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/student-view-grades-compositions/:classroomId')
  studentViewGradesCompositions(
    @Request() req: any,
    @Param('classroomId') classroomId: string,
  ) {
    const studentId: string = req.user.id;
    return this.classroomsService.studentViewGradesCompositions(
      studentId,
      classroomId,
    );
  }

  // OK
  @UseGuards(JwtAuthGuard)
  @Post('/:classroomId/close-review/:reviewId')
  closeReview(
    @Request() req: any,
    @Param('classroomId') classroomId: string,
    @Param('reviewId') reviewId: string,
    @Body() closeReviewDto: CloseReviewDto,
  ) {
    const userId = req.user.id;
    return this.classroomsService.closeReview(
      userId,
      classroomId,
      reviewId,
      closeReviewDto,
    );
  }
}
