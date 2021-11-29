import { Classes } from 'src/classes/class.entity';
import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, ManyToOne } from 'typeorm';

@Entity()
export class Assignment extends BaseEntity {
  @Column()
  name: string;

  @Column()
  point: number;

  @Column()
  order: number;

  @ManyToOne(() => Classes, (classes) => classes.assignments)
  class: Classes;
}
