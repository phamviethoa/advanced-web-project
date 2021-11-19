import { Column, Entity } from 'typeorm';
import { BaseEntity } from 'src/common/base.entity';

@Entity()
export class Classes extends BaseEntity {
  @Column({ type: 'varchar' })
  subject: string;

  @Column({ type: 'varchar' })
  description: string;
}
