import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Notification extends BaseEntity {
  @Column()
  from: string;

  @Column()
  link: string;

  @Column()
  message: string;

  @Column()
  isChecked: boolean;

  @ManyToOne(() => User, (user) => user.notifications)
  user: User;
}
