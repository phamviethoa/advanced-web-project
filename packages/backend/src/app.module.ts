import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesController } from './classes/classes.controller';
import { ClassesModule } from 'src/classes/classes.module';
import { UsersController } from './users/users.controller';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from './auth/auth.module';

require('dotenv').config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_DATABASE,
      entities: ['src/**/*.ts', './build/src/**/*.js'],
      synchronize: true,
      autoLoadEntities: true,
    }),
    ClassesModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController, ClassesController, UsersController],
  providers: [AppService],
})
export class AppModule {}
