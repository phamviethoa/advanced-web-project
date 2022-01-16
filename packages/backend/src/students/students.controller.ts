import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { JoinClassByCodeDto } from './dto/join-class-by-code.dto';
import { MappingStudentDto } from './dto/mapping-student.dto';
import { RequestGradeReviewDto } from './dto/request-grade-review.dto';
import { StudentsService } from './students.service';

@Controller('students')
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  // OK
  @Get()
  @UseGuards(JwtAuthGuard)
  getStudents(@Request() req: any) {
    const userId = req.user.id;
    return this.studentsService.getAll(userId);
  }

  @Get(':id')
  findById(@Param('id') id: string) {
    return this.studentsService.findOne(id);
  }

  // OK
  @UseGuards(JwtAuthGuard)
  @Post('/join-class-by-code')
  joinClassByCode(
    @Request() req: any,
    @Body() joinClassByCodeDto: JoinClassByCodeDto,
  ) {
    const userId: string = req.user.id;
    return this.studentsService.joinClassByCode(userId, joinClassByCodeDto);
  }

  // OK
  @UseGuards(JwtAuthGuard)
  @Post('/request-grade-review/:gradeId')
  requestGradeReview(
    @Request() req: any,
    @Param('gradeId') gradeId: string,
    @Body() requestGradeReviewDto: RequestGradeReviewDto,
  ) {
    const userId: string = req.user.id;
    return this.studentsService.requestGradeReview(
      userId,
      gradeId,
      requestGradeReviewDto,
    );
  }

  // OK
  @Get(':id/unmap')
  @UseGuards(JwtAuthGuard)
  unmapStudent(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.studentsService.unmap(userId, id);
  }

  // OK
  @Post(':id/map')
  @UseGuards(JwtAuthGuard)
  mapStudent(
    @Request() req: any,
    @Param('id') id: string,
    @Body() dto: MappingStudentDto,
  ) {
    const accountId = dto.accountId;
    const userId = req.user.id;

    return this.studentsService.map(userId, id, accountId);
  }
}
