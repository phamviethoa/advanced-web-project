import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { Classes } from './class.entity';
import { StudentToClass } from '../student-to-class/student-to-class.entity';
import { StudentToClassService } from 'src/student-to-class/student-to-class.service';

@Module({
  imports: [TypeOrmModule.forFeature([Classes,StudentToClass])],
  controllers: [ClassesController],
  providers: [ClassesService, StudentToClassService],
  exports: [ClassesService],
})
export class ClassesModule {}
