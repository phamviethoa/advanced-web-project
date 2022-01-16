import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Assignment } from 'src/entities/assignment.entity';
import { GradeComment } from 'src/entities/grade-comment.entity';
import { GradeReview } from 'src/entities/grade-review.entity';
import { Student } from 'src/entities/student.entity';
import { User } from 'src/entities/user.entity';
import notificationTemplate from 'src/notifications/notification-template';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Repository } from 'typeorm';
import { AddGradeCommentDto } from './dto/add-grade-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(GradeReview) private reviewsRepo: Repository<GradeReview>,
    @InjectRepository(GradeComment)
    private commentsRepo: Repository<GradeComment>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Student) private studentsRepo: Repository<Student>,
    @InjectRepository(Assignment)
    private assignmentsRepo: Repository<Assignment>,
    private readonly notificationsService: NotificationsService,
  ) {}

  async addGradeComment(userId: string, dto: AddGradeCommentDto) {
    const { reviewId, message } = dto;
    const user = await this.usersRepo.findOne(userId);

    if (!user) {
      throw new ForbiddenException();
    }

    const review = await this.reviewsRepo.findOne(reviewId);

    if (!review) {
      throw new NotFoundException();
    }

    const newGradeComment = this.commentsRepo.create({
      message,
      review,
      user,
    });

    const student = await this.studentsRepo
      .createQueryBuilder('student')
      .innerJoin('student.grades', 'grade')
      .innerJoin('student.classroom', 'classroom')
      .addSelect(['classroom.id', 'classroom.subject'])
      .innerJoin('grade.review', 'review')
      .innerJoinAndSelect('student.user', 'user')
      .where('review.id = :reviewId', { reviewId })
      .getOne();

    const assignment = await this.assignmentsRepo
      .createQueryBuilder('assignment')
      .innerJoin('assignment.grades', 'grade')
      .innerJoin('grade.review', 'review')
      .where('review.id = :reviewId', { reviewId })
      .getOne();

    if (student.user.id !== userId) {
      this.notificationsService.addNotification(
        user.fullName,
        student.user.id,
        notificationTemplate.replyForStudentReview(
          assignment.name,
          student.classroom.subject,
        ),
        `${process.env.FRONT_END_URL}/class/${student.classroom.id}/review/${reviewId}`,
      );
    }

    return this.commentsRepo.save(newGradeComment);
  }
}
