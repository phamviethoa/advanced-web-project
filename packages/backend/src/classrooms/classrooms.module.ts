import { Module } from '@nestjs/common';
import { ClassroomsService } from './classrooms.service';
import { ClassroomsController } from './classrooms.controller';
import { Classroom } from 'src/entities/classroom.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Assignment } from 'src/entities/assignment.entity';
import { User } from 'src/entities/user.entity';

@Module({
  // imports: [
  //   TypeOrmModule.forFeature([Classroom, Assignment, User]),
  // ],
  controllers: [ClassroomsController],
  providers: [ClassroomsService]
})
export class ClassroomsModule {}
