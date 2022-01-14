import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from 'src/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { Notification } from 'src/entities/notification.entity';
import { Classroom } from 'src/entities/classroom.entity';
import { Student } from 'src/entities/student.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User,Notification, Classroom, Student]),
  JwtModule.register({
    secret: 'secret',
  }),],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
