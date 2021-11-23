import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesController } from './classes.controller';
import { ClassesService } from './classes.service';
import { Classes } from './class.entity';
import {ClassToUserModule} from 'src/classtouser/classes.module';

@Module({
  imports: [TypeOrmModule.forFeature([Classes]), ClassToUserModule],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
