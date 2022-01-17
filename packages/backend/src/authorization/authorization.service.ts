import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from 'src/entities/classroom.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthorizationService {
  constructor(
    @InjectRepository(Classroom) private classesRepo: Repository<Classroom>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async isTeacher(userId: string, classroomId: string) {
    if (!userId || !classroomId) {
      return false;
    }

    const user = await this.usersRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.classrooms', 'classroom')
      .where('user.id = :userId', { userId })
      .getOne();

    if (
      !user ||
      !user.classrooms.find((classroom) => classroom.id === classroomId)
    ) {
      return false;
    }

    return true;
  }

  async isStudent(userId: string, classroomId: string) {
    if (!userId || !classroomId) {
      return false;
    }

    const user = await this.usersRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.students', 'student')
      .leftJoinAndSelect('student.classroom', 'classroom')
      .where('user.id = :userId', { userId })
      .getOne();

    if (!user) {
      return false;
    }

    if (user.students.length === 0) {
      return false;
    }

    if (!user.students.map((student) => student.classroom.id === classroomId)) {
      return false;
    }

    return true;
  }

  async isAdmin(userId: string) {
    if (!userId) {
      return false;
    }

    const user = await this.usersRepo.findOne(userId);
    return user.isAdmin;
  }
}
