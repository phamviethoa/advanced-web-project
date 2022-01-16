import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from 'src/entities/classroom.entity';
import { GradeReview, ReviewStatus } from 'src/entities/grade-review.entity';
import { Grade } from 'src/entities/grade.entity';
import { Student } from 'src/entities/student.entity';
import { User } from 'src/entities/user.entity';
import notificationTemplate from 'src/notifications/notification-template';
import { NotificationsService } from 'src/notifications/notifications.service';
import { Repository } from 'typeorm';
import { JoinClassByCodeDto } from './dto/join-class-by-code.dto';
import { RequestGradeReviewDto } from './dto/request-grade-review.dto';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepo: Repository<Student>,

    @InjectRepository(Grade)
    private gradesRepo: Repository<Grade>,

    @InjectRepository(GradeReview)
    private gradeReviewsRepo: Repository<GradeReview>,

    @InjectRepository(Classroom)
    private classesRepo: Repository<Classroom>,

    @InjectRepository(User)
    private usersRepo: Repository<User>,

    private readonly notificationsService: NotificationsService,
  ) {}

  async findOne(id: string) {
    return await this.studentsRepo.findOne(id, {
      relations: ['student', 'class'],
    });
  }

  async getAll(userId: string) {
    const user = await this.usersRepo.findOne(userId);

    if (!user || !user.isAdmin) {
      throw new ForbiddenException();
    }

    const students = await this.studentsRepo
      .createQueryBuilder('student')
      .innerJoin('student.classroom', 'classroom')
      .addSelect(['classroom.id', 'classroom.subject'])
      .leftJoin('student.user', 'user')
      .addSelect(['user.id', 'user.email'])
      .getMany();

    return students;
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

  async joinClassByCode(userId: string, dto: JoinClassByCodeDto) {
    const { code, identity } = dto;
    const classroom = await this.classesRepo.findOne({ where: { code } });
    const user = await this.usersRepo.findOne(userId);

    if (!classroom || !user) {
      throw new BadRequestException();
    }

    const newStudent = this.studentsRepo.create({
      identity,
      fullName: user.fullName,
      classroom,
      user,
    });

    return this.studentsRepo.save(newStudent);
  }

  async requestGradeReview(
    userId: string,
    gradeId: string,
    dto: RequestGradeReviewDto,
  ) {
    const { expectation, explanation } = dto;
    const user = await this.usersRepo.findOne(userId);
    const student = await this.studentsRepo.findOne({
      where: { user },
      relations: ['classroom'],
    });
    const grade = await this.gradesRepo.findOne(gradeId, {
      relations: ['student'],
    });

    if (!grade) {
      throw new BadRequestException();
    }

    if (grade.student.id !== student.id) {
      throw new UnauthorizedException();
    }

    const newGradeReview = this.gradeReviewsRepo.create({
      expectation,
      explanation,
      status: ReviewStatus.ACTIVE,
      grade,
    });

    const teachers = await this.usersRepo
      .createQueryBuilder('teacher')
      .innerJoin('teacher.classrooms', 'classroom')
      .innerJoin('classroom.assignments', 'assignment')
      .innerJoin('assignment.grades', 'grade')
      .where('grade.id = :gradeId', { gradeId })
      .select(['teacher.id', 'classroom.subject'])
      .getMany();

    const result = await this.gradeReviewsRepo.save(newGradeReview);

    teachers.forEach((teacher) => {
      this.notificationsService.addNotification(
        student.fullName,
        teacher.id,
        notificationTemplate.requestGradeReview(student.classroom.subject),
        `${process.env.FRONT_END_URL}/class/${student.classroom.id}/review/${result.id}`,
      );
    });
  }

  async unmap(userId: string, studentId: string) {
    const user = await this.usersRepo.findOne(userId);

    if (!user || !user.isAdmin) {
      throw new ForbiddenException();
    }

    const student = await this.studentsRepo.findOne(studentId);

    if (!student) {
      throw new NotFoundException();
    }

    return this.studentsRepo.save({ ...student, user: null });
  }

  async map(userId: string, studentId: string, mappedAccountId: string) {
    const user = await this.usersRepo.findOne(userId);

    if (!user || !user.isAdmin) {
      throw new ForbiddenException();
    }

    const student = await this.studentsRepo
      .createQueryBuilder('student')
      .leftJoinAndSelect('student.classroom', 'classroom')
      .getOne();

    //const mappedAccount = await this.usersRepo.findOne(mappedAccountId, {
    //relations: ['user.students', 'user.students.classroom'],
    //});

    const mappedAccount = await this.usersRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.students', 'student')
      .leftJoinAndSelect('student.classroom', 'classroom')
      .where('user.id = :mappedAccountId', { mappedAccountId })
      .getOne();

    if (
      mappedAccount.students.find(
        (student) => student.classroom.id === student.classroom.id,
      )
    ) {
      throw new BadRequestException();
    }

    return this.studentsRepo.save({ ...student, user: mappedAccount });
  }
}
