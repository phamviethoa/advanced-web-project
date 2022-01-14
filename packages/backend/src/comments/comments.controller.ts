import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CommentsService } from './comments.service';
import { AddGradeCommentDto } from './dto/add-grade-comment.dto';

@Controller('comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  addGradeComment(
    @Request() req: any,
    @Body() addGradeCommentDto: AddGradeCommentDto,
  ) {
    const userId = req.user.id;
    return this.commentsService.addGradeComment(userId, addGradeCommentDto);
  }
}
