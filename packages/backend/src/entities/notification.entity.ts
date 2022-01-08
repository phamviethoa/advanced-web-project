import { Student } from './student.entity';
import { Assignment } from './assignment.entity';
import { BaseEntity } from 'src/common/base.entity';
import { Column, Entity, ManyToMany, ManyToOne, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { Grade } from './grade.entity';


@Entity()
export class Notification extends BaseEntity {

    @ManyToOne(() => User, (user) => user.notificationsSended)
    fromUser: User;

    @ManyToMany(()=>User, (user) => user.notificationsReceived)
    toUser: User[];

    @ManyToOne(()=>Grade, (grade)=> grade.reviews)
    gradeNeedToRivew?: Grade;

    @Column()
    expectationGrade?: number;

    @Column()
    description: string;

}