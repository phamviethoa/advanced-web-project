import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentToClass } from './student-to-class.entity';
import { User } from 'src/users/user.entity';
import { Classes } from 'src/classes/class.entity';
@Injectable()
export class StudentToClassService {
    constructor(
        @InjectRepository(StudentToClass) private tasksRepo: Repository<StudentToClass>,
      ) {}
    create(body: any) {
        const newitem=new StudentToClass();
        newitem.studentId=body.studentId;
        newitem.classId=body.classId;
        return this.tasksRepo.save(newitem);
      }
      async findAllpartici(classid: string): Promise<any> {
        const partics = await this.tasksRepo.find({ where: { classid } });
        return partics;
      }
}
