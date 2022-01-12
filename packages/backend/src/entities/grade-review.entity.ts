import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, OneToMany, OneToOne } from 'typeorm';
import { GradeComment } from './grade-comment.entity';
import { Grade } from './grade.entity';

enum ReviewStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
}

@Entity()
export class GradeReview extends BaseEntity {
  @Column()
  expectation: number;

  @Column()
  explanation: string;

  @Column()
  status: ReviewStatus;

  @OneToOne(() => Grade)
  @JoinColumn()
  grade: Grade;

  @OneToMany(() => GradeComment, (comment) => comment.review)
  comments: GradeComment[];
}
