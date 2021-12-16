import { Assignment } from './assignment.entity';
import { Student } from './student.entity';
import { User } from 'src/entities/user.entity';
import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, ManyToMany, JoinTable, OneToMany } from 'typeorm';

@Entity()
export class Classroom extends BaseEntity {
  @Column({ type: 'varchar' })
  subject: string;

  @Column({ type: 'varchar' })
  description: string;

  @ManyToMany(() => User, (teacher) => teacher.classrooms, { eager: true })
  @JoinTable()
  teachers: User[];

  @ManyToMany(() => Student, (student) => student.classrooms, { eager: true })
  students: Student[];

  @OneToMany(() => Assignment, (assignment) => assignment.classroom, {
    eager: true,
  })
  assignments: Assignment[];
}
