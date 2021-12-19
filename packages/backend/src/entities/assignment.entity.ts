import { Grade } from './grade.entity';
import { Classroom } from './classroom.entity';
import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, ManyToOne, OneToMany } from 'typeorm';

@Entity()
export class Assignment extends BaseEntity {
  @Column('varchar')
  name: string;

  @Column()
  maxPoint: number;

  @Column()
  isFull: boolean;

  @ManyToOne(() => Classroom, (classroom) => classroom.assignments)
  classroom: Classroom;

  @OneToMany(() => Grade, (grade) => grade.assignment, { eager: true })
  grades: Grade[];
}
