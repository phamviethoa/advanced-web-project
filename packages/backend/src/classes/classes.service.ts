import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classes } from './class.entity';
import { UsersService } from 'src/users/users.service';
import { StudentToClass } from 'src/student-to-class/student-to-class.entity';
import { StudentToClassService } from 'src/student-to-class/student-to-class.service';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Classes) private classesRepo: Repository<Classes>,
    private jwtService: JwtService,
    private usersService: UsersService,
    private studentToClassService: StudentToClassService,
  ) {}
  async findAll(): Promise<Classes[]> {
    return this.classesRepo.find();
  }

  findOne(id: number) {
    return this.classesRepo.findOne(id, {
      relations: ['teachers', 'studentToClass'],
    });
  }

  create(body: any) {
    const newClasses = new Classes();
    newClasses.subject = body.subject;
    newClasses.description = body.description;
    return this.classesRepo.save(newClasses);
  }

  async update(id: string, body: any) {
    const task = await this.classesRepo.findOne(id);
    this.classesRepo.merge(task, body);
    return this.classesRepo.save(task);
  }

  async remove(id: string) {
    await this.classesRepo.delete(id);
    return true;
  }

  async getInviteStudentLink(id: string) {
    const payload = {
      classId: id,
    };

    const token = this.jwtService.sign(payload);

    return `${process.env.FRONT_END_URL}/class/add-student-by-link?token=${token}`;
  }

  async addStudent(email: string, identity: string, token: string) {
    console.log('Token: ', token);

    const payload = this.jwtService.verify(token);
    const classId = payload.classId;

    console.log('payload: ', payload);
    console.log('classId: ', classId);

    const classroom = await this.classesRepo.findOne(classId);
    const student = await this.usersService.findOne(email);

    if (!classroom || !student) {
      throw new BadRequestException();
    }

    const studentToClass = new StudentToClass();
    studentToClass.identity = identity;
    await this.studentToClassService.create(studentToClass);

    // Classes And Student To Class
    classroom.studentToClass = classroom.studentToClass
      ? [...classroom.studentToClass, studentToClass]
      : [studentToClass];
    await this.classesRepo.save(classroom);

    // Student And Student To Class
    student.studentToClass = student.studentToClass
      ? [...student.studentToClass, studentToClass]
      : [studentToClass];
    await this.usersService.update(student.id, student);

    return 'Add student successfully.';
  }
}
