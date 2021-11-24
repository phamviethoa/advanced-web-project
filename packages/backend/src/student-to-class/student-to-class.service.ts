import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StudentToClass } from '../student-to-class/student-to-class.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StudentToClassService {
  constructor(
    @InjectRepository(StudentToClass)
    private studentToClassRepo: Repository<StudentToClass>,
  ) {}

  async findOne(id: string) {
    return await this.studentToClassRepo.findOne(id, {
      relations: ['student', 'class'],
    });
  }

  async create1(studentToClass: any) {
    await this.studentToClassRepo.save(studentToClass);
  }

  async create(body: any) {
    const newitem = new StudentToClass();
    newitem.studentId = body.studentId;
    newitem.classId = body.classId;
    return this.studentToClassRepo.save(newitem);
  }

  async findAllpartici(classid: string): Promise<any> {
    const partics = await this.studentToClassRepo.find({ where: { classid } });
    return partics;
  }
}
