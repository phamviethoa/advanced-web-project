import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ClassesController } from './classes/classes.controller';
import { ClassesModule } from './classes/classes.module';

import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { ConfigModule } from '@nestjs/config';
import { StudentToClassModule } from './student-to-class/student-to-class.module';
import { RolesGuard } from './auth/author/role.guard';
import { APP_GUARD } from '@nestjs/core';
import { GradesModule } from './grades/grades.module';
import { ClassroomsModule } from './classrooms/classrooms.module';
import { StudentsModule } from './students/students.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      //ssl: {
        //rejectUnauthorized: false,
      //},
      synchronize: true,
      autoLoadEntities: true,
    }),
    ClassesModule,
    UsersModule,
    AuthModule,
    StudentToClassModule,
    GradesModule,
    ClassroomsModule,
    StudentsModule,
  ],
  controllers: [AppController, ClassesController, UsersController],
  providers: [AppService,{
    provide: APP_GUARD,
    useClass: RolesGuard,
  },],
})
export class AppModule {}
