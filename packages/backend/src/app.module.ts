import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';

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
import { NotificationsModule } from './notifications/notifications.module';
import { CommentsModule } from './comments/comments.module';
import { FacebookStrategy } from './auth/facebook.strategy';
import { AuthorizationModule } from './authorization/authorization.module';

require('dotenv').config();

const databaseConfig: TypeOrmModuleOptions =
  process.env.NODE_ENV === 'dev'
    ? {
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        synchronize: true,
        autoLoadEntities: true,
      }
    : {
        type: 'postgres',
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        ssl: {
          rejectUnauthorized: false,
        },
        synchronize: true,
        autoLoadEntities: true,
      };

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SendGridModule.forRoot({
      apiKey: process.env.SEND_GRID_ACCESS_KEY,
    }),
    TypeOrmModule.forRoot(databaseConfig),
    MailerModule.forRoot({
      transport: {
        service: 'gmail',
        auth: {
          user: 'advanced.web.mail.server@gmail.com',
          pass: 'Admin@123Admin@123',
        },
      },
    }),
    ClassroomsModule,
    UsersModule,
    AuthModule,
    StudentsModule,
    NotificationsModule,
    CommentsModule,
    AuthorizationModule,
  ],
  controllers: [AppController, ClassroomsController, UsersController],
  providers: [
    FacebookStrategy,
    AppService,
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
