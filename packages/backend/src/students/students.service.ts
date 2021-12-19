import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Student } from 'src/entities/student.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentToClassRepo: Repository<Student>,
  ) {}

  async findOne(id: string) {
    return await this.studentToClassRepo.findOne(id, {
      relations: ['student', 'class'],
    });
  }

  async findByClassId(classId: string): Promise<Student> {
    return await this.studentToClassRepo.findOne({ where: { classId } });
  }

  async create(body: any) {
    const newStudent = this.studentToClassRepo.create(body);
    return this.studentToClassRepo.save(newStudent);
  }

  async save(studentToClass: any) {
    return await this.studentToClassRepo.save(studentToClass);
  }

  async findAllpartici(classid: string): Promise<any> {
    const partics = await this.studentToClassRepo.find({ where: { classid } });
    return partics;
  }

  async findAllClasspartici(particiid: string): Promise<Student[]> {
    const partics = await this.studentToClassRepo.find({
      relations: ['class'],
      where: { studentId: particiid },
    });
    return partics;
  }
}
