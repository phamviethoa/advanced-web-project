import { Column, Entity, OneToMany } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { ClassToUser } from '../classtouser/classtouser.entity';

@Entity()
export class Classes extends BaseEntity {
  @Column({ type: 'varchar' })
  subject: string;

  @Column({ type: 'varchar' })
  description: string;

  @OneToMany(() => ClassToUser, (classToUser) => classToUser.classes)
  public classToUser!: Classes[];
}
