import { Module } from '@nestjs/common';
import { ClassesController } from 'src/classes/classes.controller';
import { ClassesService } from 'src/classes/classes.service';

@Module({
  imports: [],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
