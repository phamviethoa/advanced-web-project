import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentToClass } from './student-to-class.entity';
import { StudentToClassService } from './student-to-class.service';

@Module({
  imports: [TypeOrmModule.forFeature([StudentToClass])],
  providers: [StudentToClassService],
  exports: [StudentToClassService],
})
export class StudentToClassModule {}
