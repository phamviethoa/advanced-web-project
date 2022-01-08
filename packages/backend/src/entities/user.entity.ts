import { Student } from './student.entity';
import { Classroom } from './classroom.entity';
import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, ManyToMany, OneToMany } from 'typeorm';
import { Notification } from './notification.entity';

@Entity()
export class User extends BaseEntity {
  @Column()
  email: string;

  @Column()
  fullName: string;

  @Column()
  password: string;

  @ManyToMany(() => Classroom, (classroom) => classroom.teachers, {
    eager: true,
  })
  classrooms: Classroom[];

  @OneToMany(() => Student, (student) => student.user)
  students: Student[];

  @OneToMany(()=> Notification, (notification)=>notification.fromUser)
  notificationsSended: Notification[];

  @ManyToMany(()=> Notification, (notification)=>notification.toUser)
  notificationsReceived: Notification[];
}
