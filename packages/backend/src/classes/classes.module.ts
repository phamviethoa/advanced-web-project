import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesController } from './classes.controller';
import { JwtModule } from '@nestjs/jwt';
import { ClassesService } from './classes.service';
import { Classes } from './class.entity';
import { StudentToClassModule } from 'src/student-to-class/student-to-class.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { StudentToClass } from 'src/student-to-class/student-to-class.entity';
import { StudentToClassService } from 'src/student-to-class/student-to-class.service';
import { Assignment } from './assignment.entity';
import { User } from 'src/users/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Classes, StudentToClass, Assignment, User]),
    JwtModule.register({
      secret: 'secret',
    }),
    StudentToClassModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [ClassesController],
  providers: [ClassesService, StudentToClassService],
  exports: [ClassesService],
})
export class ClassesModule {}
