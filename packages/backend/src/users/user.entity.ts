import { Classes } from 'src/classes/class.entity';
import { BaseEntity } from 'src/common/base.entity';
import { Column, ManyToMany } from 'typeorm';

export class User extends BaseEntity {
  @Column({ type: 'varchar' })
  studentId: string;

  @Column({ type: 'varchar' })
  username: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar' })
  fullName: string;

  @ManyToMany(() => Classes)
  hostedClasses: Classes[];

  @ManyToMany(() => Classes)
  JoinedClasses: Classes[];
}
