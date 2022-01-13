import { Student } from './student.entity';
import { Assignment } from './assignment.entity';
import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { GradeReview } from './grade-review.entity';

@Entity()
export class Grade extends BaseEntity {
  @Column()
  point: number;

  @ManyToOne(() => Assignment, (assignment) => assignment.grades)
  assignment: Assignment;

  @ManyToOne(() => Student, (student) => student.grades)
  student: Student;

  @OneToOne(() => GradeReview, (review) => review.grade, { eager: true })
  review: GradeReview;
}
