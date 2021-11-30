import { Column, Entity, ManyToOne } from 'typeorm';
import { BaseEntity } from '../common/base.entity';
import { Classes } from './class.entity';

@Entity()
export class Assignment extends BaseEntity {
  @Column()
  name: string;

  @Column()
  point: number;

  @ManyToOne(() => Classes, (classes) => classes.assignments)
  class: Classes;
}
