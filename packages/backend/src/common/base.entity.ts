import {
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export abstract class BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at', select: false, type: 'timestamptz' })
  createdAt: Date;

  @Column({ name: 'created_by', nullable: true, select: false })
  createdBy?: string;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;

  @Column({ name: 'updated_by', nullable: true, select: false })
  updatedBy?: string;
}
