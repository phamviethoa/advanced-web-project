import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { GradeReview } from './grade-review.entity';
import { User } from './user.entity';

@Entity()
export class GradeComment extends BaseEntity {
  @Column()
  message: string;

  @ManyToOne(() => GradeReview, (review) => review.comments)
  review: GradeReview;

  @ManyToOne(() => User, (user) => user.comments)
  teacher: User;
}
