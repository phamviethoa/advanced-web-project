import { Student } from './student.entity';
import { Classroom } from './classroom.entity';
import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  fullName: string;

  @ManyToMany(() => Classroom, (classroom) => classroom.teachers, {
    eager: true,
  })
  classrooms: Classroom[];

  @OneToMany(() => Student, (student) => student.user, { eager: true })
  students: Student[];
}
