import { Classes } from 'src/classes/class.entity';
import { User } from 'src/users/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity()
export class StudentToClass extends BaseEntity {
  @Column()
  public studentId!: string;

  @Column()
  public classId!: string;

  @Column()
  public identity!: string;

  @ManyToOne(() => User, (user) => user.studentToClass)
  public student!: User;

  @ManyToOne(() => Classes, (user) => user.studentToClass)
  public class!: Classes;
}
