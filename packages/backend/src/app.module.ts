import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';

import { StudentsModule } from './students/students.module';

import { UsersController } from './users/users.controller';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { ConfigModule } from '@nestjs/config';
import { RolesGuard } from './auth/author/role.guard';
import { APP_GUARD } from '@nestjs/core';
import { ClassroomsModule } from './classes/classrooms.module';
import { ClassroomsController } from './classes/classrooms.controller';

import { SendGridModule } from '@ntegral/nestjs-sendgrid';
import { MailerModule } from '@nestjs-modules/mailer';
//import { PugAdapter } from '@nestjs-modules/mailer/dist/adapters/pug.adapter';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SendGridModule.forRoot({
      apiKey: process.env.SEND_GRID_ACCESS_KEY,
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
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: process.env.USER,
          pass: process.env.PASS,
        },
      },
    }),
    ClassroomsModule,
    UsersModule,
    AuthModule,
    StudentsModule,
  ],
  controllers: [AppController, ClassroomsController, UsersController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
