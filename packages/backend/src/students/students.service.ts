import {
  BadRequestException,
  Injectable,
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

    teachers.forEach((teacher) => {
      this.notificationsService.addNotification(
        teacher.id,
        notificationTemplate.requestGradeReview(
          student.fullName,
          student.classroom.subject,
        ),
      );
    });

    return this.gradeReviewsRepo.save(newGradeReview);
  }
}
