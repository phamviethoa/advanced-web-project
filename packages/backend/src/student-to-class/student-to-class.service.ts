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

  async create(studentToClass: any) {
    await this.studentToClassRepo.save(studentToClass);
  }
}
