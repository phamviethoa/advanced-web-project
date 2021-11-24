import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StudentToClassController } from './student-to-class.controller';
import { StudentToClass } from './student-to-class.entity';
import { StudentToClassService } from './student-to-class.service';

@Module({
  imports: [TypeOrmModule.forFeature([StudentToClass])],
  controllers: [StudentToClassController],
  providers: [StudentToClassService],
  exports: [StudentToClassService],
})
export class StudentToClassModule {}
