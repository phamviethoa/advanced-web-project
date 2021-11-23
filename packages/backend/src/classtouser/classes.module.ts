import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassToUserController } from './classtouser.controller';
import { ClassToUserService } from './classtouser.service';
import { ClassToUser } from './classtouser.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ClassToUser])],
  controllers: [ClassToUserController],
  providers: [ClassToUserService],
  exports: [ClassToUserService],
})
export class ClassToUserModule {}
