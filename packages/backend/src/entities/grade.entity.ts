import { Student } from './student.entity';
import { Assignment } from './assignment.entity';
import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';
import { Notification } from './notification.entity';
@Entity()
export class Grade extends BaseEntity {
  @Column()
  point: number;

  @ManyToOne(() => Assignment, (assignment) => assignment.grades)
  assignment: Assignment;

  @ManyToOne(() => Student, (student) => student.grades)
  student: Student;

  @OneToMany(()=> Notification, (notification) => notification.gradeNeedToRivew)
  reviews: Notification[]

  @Column({ default: false })
  isFinalized: boolean;
}
