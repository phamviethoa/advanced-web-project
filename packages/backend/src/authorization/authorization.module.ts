import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Classroom } from 'src/entities/classroom.entity';
import { Student } from 'src/entities/student.entity';
import { User } from 'src/entities/user.entity';
import { AuthorizationService } from './authorization.service';

@Module({
  imports: [TypeOrmModule.forFeature([Classroom, User, Student])],
  providers: [AuthorizationService],
  exports: [AuthorizationService],
})
export class AuthorizationModule {}
