import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { GradeComment } from 'src/entities/grade-comment.entity';
import { GradeReview } from 'src/entities/grade-review.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { AddGradeCommentDto } from './dto/add-grade-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(GradeReview) private reviewsRepo: Repository<GradeReview>,
    @InjectRepository(GradeComment)
    private commentsRepo: Repository<GradeComment>,
    @InjectRepository(User) private usersRepo: Repository<User>,
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

    return this.commentsRepo.save(newGradeComment);
  }
}
