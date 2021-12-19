import { User } from './user.entity';
import { Grade } from './grade.entity';
import { Classroom } from './classroom.entity';
import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, ManyToMany, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Student extends BaseEntity {
  @Column()
  identity: string;

  @Column()
  fullName: string;

  @ManyToMany(() => Classroom, (classroom) => classroom.students)
  classrooms: Classroom[];

  @OneToMany(() => Grade, (grade) => grade.student)
  grades: Grade[];

  @ManyToOne(() => User, (user) => user.students)
  user?: User;
}
