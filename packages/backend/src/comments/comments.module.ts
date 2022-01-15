import { Module } from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GradeReview } from 'src/entities/grade-review.entity';
import { GradeComment } from 'src/entities/grade-comment.entity';
import { User } from 'src/entities/user.entity';
import { Student } from 'src/entities/student.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
import { Assignment } from 'src/entities/assignment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      GradeReview,
      GradeComment,
      User,
      Student,
      Assignment,
    ]),
    NotificationsModule,
  ],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
