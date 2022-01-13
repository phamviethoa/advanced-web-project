import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Classroom } from 'src/entities/classroom.entity';
import { GradeComment } from 'src/entities/grade-comment.entity';
import { GradeReview } from 'src/entities/grade-review.entity';
import { Grade } from 'src/entities/grade.entity';
import { Student } from 'src/entities/student.entity';
import { User } from 'src/entities/user.entity';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Student,
      Grade,
      GradeReview,
      GradeComment,
      Classroom,
      User,
    ]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
