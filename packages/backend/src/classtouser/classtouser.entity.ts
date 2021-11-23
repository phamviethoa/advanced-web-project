import { Classes } from 'src/classes/class.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { User } from '../users/user.entity';

@Entity()
export class ClassToUser extends BaseEntity {
  @Column()
  public classid!: string;

  @Column()
  public userid!: string;

  @Column()
  public isstudent!: boolean;

  @Column()
  public participantid!: string;

  @ManyToOne(() => User, (user) => user.classToUser)
  public user!: User;

  @ManyToOne(() => Classes, (classes) => classes.classToUser)
  public classes!: Classes;
}
