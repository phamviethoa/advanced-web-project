import { Module } from '@nestjs/common';
import { UsersController } from 'src/classes/users.controller';
import { UsersService } from 'src/classes/users.service';

@Module({
  imports: [],
  controllers: [ClassesController],
  providers: [ClassesService],
})
export class ClassesModule {}
