import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { User } from 'src/users/user.entity';
import { StudentToClass } from 'src/student-to-class/student-to-class.entity';

@Entity()
export class Classes extends BaseEntity {
  @Column({ type: 'varchar' })
  subject: string;

  @Column({ type: 'varchar' })
  description: string;

  @ManyToMany(() => User, (user) => user.hostedClasses)
  teachers: User[];

  @OneToMany(() => StudentToClass, (studentToClass) => studentToClass.class)
  studentToClass: StudentToClass[];
}
