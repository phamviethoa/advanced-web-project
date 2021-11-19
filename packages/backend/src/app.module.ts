import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassesService } from './classes/classes.service';
import { ClassesController } from './classes/classes.controller';
import { ClassesModule } from 'src/classes/classes.module';

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
      synchronize: Boolean(process.env.DB_SYNC),
      autoLoadEntities: true,
    }),
    ClassesModule,
  ],
  controllers: [AppController, ClassesController],
  providers: [AppService, ClassesService],
})
export class AppModule {}
