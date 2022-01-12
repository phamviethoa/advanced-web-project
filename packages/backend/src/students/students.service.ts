import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Grade } from 'src/entities/grade.entity';
import { Student } from 'src/entities/student.entity';
import { Repository } from 'typeorm';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepo: Repository<Student>,

    @InjectRepository(Grade)
    private gradesRepo: Repository<Grade>,
  ) {}

  async findOne(id: string) {
    return await this.studentsRepo.findOne(id, {
      relations: ['student', 'class'],
    });
  }

  async findByClassId(classId: string): Promise<Student> {
    return await this.studentsRepo.findOne({ where: { classId } });
  }

  async create(body: any) {
    const newStudent = this.studentsRepo.create(body);
    return this.studentsRepo.save(newStudent);
  }

  async save(studentToClass: any) {
    return await this.studentsRepo.save(studentToClass);
  }

  async findAllpartici(classid: string): Promise<any> {
    const partics = await this.studentsRepo.find({ where: { classid } });
    return partics;
  }

  async findAllClasspartici(particiid: string): Promise<Student[]> {
    const partics = await this.studentsRepo.find({
      relations: ['class'],
      where: { studentId: particiid },
    });
    return partics;
  }
}
