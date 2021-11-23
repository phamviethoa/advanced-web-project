import { Classes, ClassToUser } from '../classes/class.entity';
import { BaseEntity } from '../common/base.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';

@Entity()
export class User extends BaseEntity {
  @Column({ type: 'varchar', nullable: true })
  studentId: string;

  @Column({ type: 'varchar' })
  username: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', nullable: true })
  fullName: string;

  @ManyToMany(() => Classes)
  hostedClasses: Classes[];

  @ManyToMany(() => Classes)
  JoinedClasses: Classes[];

  @OneToMany(() => ClassToUser, classToUser => classToUser.user)
  public classToUser!: Classes[];
}
