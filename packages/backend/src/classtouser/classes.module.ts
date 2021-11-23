import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesController } from './classtouser.controller';
import { ClassesService } from './classtouser.service';
import { ClassToUser } from './classtouser.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClassToUser])],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
