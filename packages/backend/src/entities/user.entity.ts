import { Student } from './student.entity';
import { Classroom } from './classroom.entity';
import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @Column()
  username: string;

  @Column()
  fullName: string;

  @Column()
  password: string;

  @ManyToMany(() => Classroom, (classroom) => classroom.teachers, {
    eager: true,
  })
  classrooms: Classroom[];

  @OneToMany(() => Student, (student) => student.user, { eager: true })
  students: Student[];
}
