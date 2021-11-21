import { Column, Entity, ManyToMany } from 'typeorm';
import { BaseEntity } from 'src/common/base.entity';
import { User } from 'src/users/user.entity';

@Entity()
export class Classes extends BaseEntity {
  @Column({ type: 'varchar' })
  subject: string;

  @Column({ type: 'varchar' })
  description: string;

  @ManyToMany(() => User)
  teachers: User[];

  @ManyToMany(() => User)
  students: User[];
}
