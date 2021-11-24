import { Classes } from 'src/classes/class.entity';
import { User } from 'src/users/user.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/base.entity';

@Entity()
export class StudentToClass extends BaseEntity {
  @Column({ nullable: true })
  public studentId?: string;

  @Column({ nullable: true })
  public classId?: string;

  @Column()
  public identity: string;

  @ManyToOne(() => User)
  public student: User;

  @ManyToOne(() => Classes)
  public class: Classes;
}
