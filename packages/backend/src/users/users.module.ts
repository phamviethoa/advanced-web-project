import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from 'src/entities/user.entity';
import { JwtModule } from '@nestjs/jwt';
import { Notification } from 'src/entities/notification.entity';
@Module({
  imports: [TypeOrmModule.forFeature([User,Notification]),
  JwtModule.register({
    secret: 'secret',
  }),],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
