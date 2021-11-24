import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesController } from './classes.controller';
import { JwtModule } from '@nestjs/jwt';
import { ClassesService } from './classes.service';
import { Classes } from './class.entity';
import { StudentToClassModule } from 'src/student-to-class/student-to-class.module';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Classes]),
    JwtModule.register({
      secret: 'secret',
    }),
    StudentToClassModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [ClassesController],
  providers: [ClassesService],
  exports: [ClassesService],
})
export class ClassesModule {}
