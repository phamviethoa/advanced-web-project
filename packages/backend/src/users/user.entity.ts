import { Classes } from '../classes/class.entity';
import { BaseEntity } from '../common/base.entity';
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from 'typeorm';
import { StudentToClass } from 'src/student-to-class/student-to-class.entity';

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'varchar' })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  fullName: string;

  @ManyToMany(() => Classes, (classes) => classes.teachers)
  @JoinTable()
  hostedClasses: Classes[];

  @OneToMany(() => StudentToClass, (studentToClass) => studentToClass.student)
  studentToClass: StudentToClass[];
}
