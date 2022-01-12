import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeComment } from 'src/entities/grade-comment.entity';
import { GradeReview } from 'src/entities/grade-review.entity';
import { Grade } from 'src/entities/grade.entity';
import { Student } from 'src/entities/student.entity';
import { StudentsController } from './students.controller';
import { StudentsService } from './students.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Grade, GradeReview, GradeComment]),
  ],
  controllers: [StudentsController],
  providers: [StudentsService],
  exports: [StudentsService],
})
export class StudentsModule {}
