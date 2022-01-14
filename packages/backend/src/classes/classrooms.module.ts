import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { Assignment } from 'src/entities/assignment.entity';
import { User } from 'src/entities/user.entity';
import { Classroom } from 'src/entities/classroom.entity';
import { Student } from 'src/entities/student.entity';
import { StudentsModule } from 'src/students/students.module';
import { StudentsService } from 'src/students/students.service';
import { ClassroomsController } from './classrooms.controller';
import { ClassroomsService } from './classrooms.service';
import { Grade } from 'src/entities/grade.entity';
import { Notification } from 'src/entities/notification.entity';
import { GradeReview } from 'src/entities/grade-review.entity';
import { NotificationsModule } from 'src/notifications/notifications.module';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Classroom,
      Assignment,
      Student,
      User,
      Grade,
      Notification,
      GradeReview,
    ]),
    JwtModule.register({
      secret: 'secret',
    }),
    StudentsModule,
    UsersModule,
    AuthModule,
    NotificationsModule,
  ],
  controllers: [ClassroomsController],
  providers: [ClassroomsService, StudentsService],
  exports: [ClassroomsService],
})
export class ClassroomsModule {}
