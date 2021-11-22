import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesController } from 'src/classes/classes.controller';
import { ClassesService } from 'src/classes/classes.service';
import { Classes } from './class.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Classes])
  ],
  exports: [TypeOrmModule],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
