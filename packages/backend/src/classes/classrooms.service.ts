import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  Response,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateAssignmentDto } from './dto/update-assignments.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { Classroom } from 'src/entities/classroom.entity';
import { User } from 'src/entities/user.entity';
import { Assignment } from 'src/entities/assignment.entity';
import { Student } from 'src/entities/student.entity';
import { Grade } from 'src/entities/grade.entity';
import { UpdateGradeDTO } from './dto/update-grade-dto';
import { stream, utils, write, writeFile } from 'xlsx';
import { unlink } from 'fs';
import { InviteByEmailDTO } from './dto/invite-by-email-dto';
import { InjectSendGrid, SendGridService } from '@ntegral/nestjs-sendgrid';
import { async, NotFoundError, throwError } from 'rxjs';
import { Max } from 'class-validator';
import { createTransport } from 'nodemailer';
import passport, { use } from 'passport';
import { ReviewGradelDTO } from './dto/review-grade.dto';
import { Notification } from 'src/entities/notification.entity';
import { CommentReviewDTO } from './dto/comment-review.dto';
import { ViewOfStudentCommentsDTO } from './dto/viewofstudentcomments.dto';
import { ViewListOfRequestByStudent } from './dto/viewlistofrequest.dto';
import { FinalizedReviewDTO } from './dto/finalizedreview.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { GradeReview, ReviewStatus } from 'src/entities/grade-review.entity';
import { CloseReviewDto } from './dto/close-review.dto';
import { error } from 'console';

@Injectable()
export class ClassroomsService {
  constructor(
    @InjectRepository(Classroom) private classesRepo: Repository<Classroom>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Student) private studentsRepo: Repository<Student>,
    @InjectRepository(Assignment)
    private assignmentsRepo: Repository<Assignment>,
    @InjectRepository(Grade) private gradesRepo: Repository<Grade>,
    private jwtService: JwtService,
    @InjectRepository(Notification)
    private notificationsRepo: Repository<Notification>,
    @InjectRepository(GradeReview)
    private reviewsRepo: Repository<GradeReview>,
    private readonly mailerService: MailerService,
  ) {}
  async findAll(): Promise<Classroom[]> {
    return this.classesRepo.find();
  }

  findOne(id: string) {
    return this.classesRepo.findOneOrFail(id, {
      relations: [
        'teachers',
        'students',
        'students.grades',
        'students.user',
        'assignments',
        'assignments.grades',
        'assignments.grades.student',
      ],
    });
  }

  async findAllClassIsTeacher(userid: string) {
    const teacher = await this.usersRepo.findOne(userid);

    if (!teacher) {
      throw new BadRequestException();
    }

    return teacher.classrooms || [];
  }

  async findAllClassIsStudent(userid: string) {
    const classrooms = await this.classesRepo
      .createQueryBuilder('classroom')
      .innerJoin('classroom.students', 'student')
      .innerJoin('student.user', 'user')
      .where('user.id = :userid', { userid })
      .getMany();

    return classrooms;
  }

  async create(createClassDto: CreateClassDto, teacherId: any) {
    const newClasses = this.classesRepo.create(createClassDto);
    const teacher = await this.usersRepo.findOneOrFail(teacherId);
    newClasses.teachers = [teacher];

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

  async getInviteStudentLink(userId: string, id: string) {
    await this.checkIsTeacher(userId, id);

    const payload = {
      classId: id,
    };

    const token = this.jwtService.sign(payload);

    return `${process.env.FRONT_END_URL}/class/add-student-by-link?token=${token}`;
  }

  async getInviteTeacherLink(userId: string, id: string) {
    await this.checkIsTeacher(userId, id);

    const payload = {
      classId: id,
    };

    const token = this.jwtService.sign(payload);

    return `${process.env.FRONT_END_URL}/class/add-teacher-by-link?token=${token}`;
  }

  async addStudent(email: string, identity: string, token: string) {
    const payload = this.jwtService.verify(token);
    const classId = payload.classId;

    const classroom = await this.classesRepo.findOne(classId);
    const user = await this.usersRepo.findOneOrFail({ email });

    if (!classroom || !user) {
      throw new BadRequestException();
    }

    const newStudent = this.studentsRepo.create({
      identity,
      fullName: user.fullName,
    });

    newStudent.classroom = classroom;
    newStudent.user = user;

    this.studentsRepo.save(newStudent);
    this.usersRepo.save(user);

    return await this.classesRepo.save(classroom);
  }

  async addTeacher(email: string, token: string) {
    const payload = this.jwtService.verify(token);
    const classId = payload.classId;

    const classroom = await this.classesRepo.findOne({
      relations: ['teachers'],
      where: { id: classId },
    });
    const user = await this.usersRepo.findOneOrFail({ email });

    if (!classroom || !user) {
      throw new BadRequestException();
    }
    classroom.teachers.push(user);

    this.usersRepo.save(user);
    return await this.classesRepo.save(classroom);
  }

  async updateAssignments(id: string, AssignmentDtoFE: UpdateAssignmentDto) {
    const classes = await this.classesRepo.findOneOrFail({
      where: { id: id },
      relations: ['teachers'],
    });
    const Assignments = await this.assignmentsRepo.findAndCount({
      classroom: classes,
    });

    const DBAssignments = Assignments[0];
    const countAssigments = Assignments[1];
    let maxIndex = 0;

    if (countAssigments === 0) {
      maxIndex = 0;
    } else {
      let arrorderDBAssignments: number[] = [];
      DBAssignments.map((DBAssignment) =>
        arrorderDBAssignments.push(DBAssignment.order),
      );
      maxIndex = Math.max(...arrorderDBAssignments);
    }

    let isCreate: boolean = true;

    let indexfe = 0;
    for (const assignmentFE of AssignmentDtoFE.assignments) {
      for (const dbassignment of DBAssignments) {
        if (assignmentFE.id === dbassignment.id) {
          // TH FEName == DBName update order
          dbassignment.maxPoint = assignmentFE.maxPoint;
          dbassignment.name = assignmentFE.name;
          dbassignment.order = indexfe + 1;
          isCreate = false;
          await this.assignmentsRepo.save(dbassignment);
        }
      }
      if (isCreate === true) {
        const newAssignment = new Assignment(); // duyet xong toan bo DBAssignment nhung k co thi tao moi
        newAssignment.name = assignmentFE.name;
        newAssignment.maxPoint = assignmentFE.maxPoint;
        maxIndex++;
        newAssignment.order = maxIndex;

        newAssignment.classroom = classes;

        const newassignment = this.assignmentsRepo.create(newAssignment);
        await this.assignmentsRepo.save(newassignment);
      }
      isCreate = true;
      indexfe++;
    }

    let isRemove: boolean = true;

    for (const dbassignment of DBAssignments) {
      for (const assignmentFE of AssignmentDtoFE.assignments) {
        if (assignmentFE.id === dbassignment.id) {
          isRemove = false;
        }
      }
      if (isRemove === true) {
        await this.assignmentsRepo.delete(dbassignment);
      }
      isRemove = true;
    }

    await this.classesRepo.save(classes);
    return await this.assignmentsRepo.find({
      classroom: classes,
    });
  }

  async findAllwithteacher(teacherid: string): Promise<Classroom[]> {
    const classteacher = await this.usersRepo.find({
      relations: ['hostedClasses'],
      where: { id: teacherid },
    });
    return classteacher[0].classrooms;
  }

  async markFinalized(assignmentId: string, teacherId: string) {
    const teacher = await this.usersRepo.findOne(teacherId);
    const assignment = await this.assignmentsRepo.findOne(assignmentId, {
      relations: ['classroom', 'classroom.teachers'],
    });
    const classroom = assignment.classroom;

    if (!teacher || !assignment) {
      throw new BadRequestException();
    }

    if (!classroom.teachers.find((teacher) => teacher.id === teacherId)) {
      throw new UnauthorizedException();
    }

    return this.assignmentsRepo.save({ ...assignment, isFinalized: true });
  }

  downloadStudentListTemplate(res: any) {
    const filename = 'templatestudentlist.xlsx';
    return res.download('./src/classes/template/' + filename);
  }

  async savestudentlist(userId: string, workSheet: any, classroomId: string) {
    await this.checkIsTeacher(userId, classroomId);

    const ref = workSheet['!ref'];
    const array = ref.split(':');
    array[0] = array[0].replace('A', '');
    array[1] = array[1].replace('B', '');

    const classroom = await this.classesRepo.findOneOrFail({
      relations: ['students'],
      where: { id: classroomId },
    });

    const students = classroom.students;
    for (let i = parseInt(array[0]) + 1; i <= parseInt(array[1]); i++) {
      const studentId = workSheet[`A${i}`].v;
      const fullName = workSheet[`B${i}`].v;

      // ktra studentId trong classId co ton tai hay chua neu chua thi tao moi neu da ton tai thi bo qua
      var index = students.findIndex((x) => x.identity == studentId);
      console.log(index);
      if (index === -1) {
        let newstudent = new Student();
        newstudent.classroom = classroom;
        newstudent.fullName = fullName;
        newstudent.identity = studentId;
        await this.studentsRepo.save(newstudent);
      } else {
        console.log('object already exists');
      }
    }

    return await this.classesRepo.findOneOrFail({
      relations: ['students'],
      where: { id: classroomId },
    });
  }

  async saveAssignmentGrade(
    userId: string,
    workSheet: any,
    assignmentid: string,
  ) {
    const ref = workSheet['!ref'];
    const array = ref.split(':');
    array[0] = array[0].replace('A', '');
    array[1] = array[1].replace('B', '');

    const assignment = await this.assignmentsRepo.findOneOrFail({
      relations: ['classroom', 'classroom.students'],
      where: { id: assignmentid },
    });

    await this.checkIsTeacher(userId, assignment.classroom.id);

    const students = assignment.classroom.students; // danh sach hoc sinh
    const grades = await this.gradesRepo.find({
      where: { assignment: assignment },
      relations: ['student'],
    }); // danh sach diem
    console.log(grades);
    for (
      let i = parseInt(array[0]) + 1;
      i <= parseInt(array[1]);
      i++ // duyet tung dòng excel
    ) {
      const studentId = workSheet[`A${i}`].v;
      const grade = workSheet[`B${i}`].v;

      var index = students.findIndex((x) => x.identity == studentId); // vi tri neu co identity
      console.log('index: ', index);
      var index_grade = grades.findIndex(
        (x) => x.student.identity == studentId,
      ); // vi tri neu co identity
      console.log('index_grade: ', index_grade);
      if (index === -1) {
        console.log('khong ton tai sinh vien'); // khong ton tai sinh vien thi bo qua
      } else {
        if (index_grade === -1) {
          //khong ton tai diem thi tao moi
          let newGrade = new Grade();
          newGrade.student = students[index];
          newGrade.assignment = assignment;
          newGrade.point = grade;
          await this.gradesRepo.save(newGrade);
        } else {
          // da ton tai diem thi chinh sua diem
          grades[index_grade].point = grade;
          await this.gradesRepo.save(grades[index_grade]);
        }
      }
    }
    return await this.assignmentsRepo.findOneOrFail({
      relations: ['grades'],
      where: { id: assignmentid },
    });
  }

  async showstudentsgrades(userId: string, classroomId: string) {
    await this.checkIsTeacher(userId, classroomId);

    return await this.assignmentsRepo.find({
      relations: ['grades', 'grades.student', 'classroom'],
      where: { classroom: { id: classroomId } },
    });
  }

  async inputGradeStudentAssignment(userId: string, body: UpdateGradeDTO) {
    const assignment = await this.assignmentsRepo.findOne({
      where: { id: body.assignmentId },
      relations: ['classroom'],
    });
    const student = await this.studentsRepo.findOne(body.studentId);

    await this.checkIsTeacher(userId, assignment.classroom.id);

    if (!assignment || !student) {
      return new BadRequestException();
    }

    const grade = await this.gradesRepo.findOne({
      relations: ['assignment', 'student'],
      where: {
        assignment: { id: body.assignmentId },
        student: { id: body.studentId },
      },
    });

    if (!grade) {
      let newGrade = new Grade();
      newGrade.student = await this.studentsRepo.findOneOrFail({
        id: body.studentId,
      });
      newGrade.assignment = await this.assignmentsRepo.findOneOrFail({
        id: body.assignmentId,
      });
      newGrade.point = body.point;
      return await this.gradesRepo.save(newGrade);
    } else {
      grade.point = body.point;
      return await this.gradesRepo.save(grade);
    }
  }

  async exportGradeBoard(userId: string, classroomId: string, res: any) {
    await this.checkIsTeacher(userId, classroomId);

    const assignmentsgradesofstudent = await this.assignmentsRepo.find({
      relations: ['grades', 'grades.student', 'classroom'],
      where: { classroom: { id: classroomId } },
    });

    const data = [];
    const row1 = [''];

    for (const assignment of assignmentsgradesofstudent) {
      if (assignment.isFinalized === false) {
        return new BadRequestException();
      }
      row1.push(assignment.name);
    }

    row1.push('Total');
    data.push(row1);

    const classroom = await this.classesRepo.findOneOrFail({
      where: { id: classroomId },
      relations: ['students', 'students.grades'],
    });

    for (const student of classroom.students) {
      const grades = [student.fullName];
      let totalgradestudent = 0;

      for (const grade of student.grades) {
        totalgradestudent += grade.point; // cal totalgradeofstudent

        grades.push(grade.point.toString());
      }
      grades.push(totalgradestudent.toString());
      data.push(grades);
    }

    const filepath = './src/classes/template/gradeboard.xlsx';

    const wb = utils.book_new();
    utils.book_append_sheet(wb, utils.aoa_to_sheet(data), 'SheetName 1');
    await writeFile(wb, filepath);
    return await res.download(filepath);
  }

  async inviteStudentByEmail(
    classroomId: string,
    body: InviteByEmailDTO,
    userId: string,
  ) {
    const { email } = body;

    const linkInviteByEmail = await this.getInviteStudentLink(
      userId,
      classroomId,
    );

    return this.mailerService.sendMail({
      to: email,
      from: process.env.USER,
      subject: 'Link tham gia lớp học cho học sinh',
      text: `Xin chào`,
      html: `<a href= ${linkInviteByEmail}>link tham gia lớp học</a>`,
    });
  }

  async inviteTeacherByEmail(
    classroomId: string,
    body: InviteByEmailDTO,
    userId: string,
  ) {
    const { email } = body;

    const linkInviteByEmail = await this.getInviteTeacherLink(
      userId,
      classroomId,
    );

    return this.mailerService.sendMail({
      to: email,
      from: process.env.USER,
      subject: 'Link tham gia lớp học cho giáo viên',
      text: `Xin chào`,
      html: `<a href= ${linkInviteByEmail}>link tham gia lớp học</a>`,
    });
  }

  async studentViewGradesCompositions(userId: string, classroomId: string) {
    const user = await this.usersRepo.findOne({
      where: { id: userId },
      relations: [
        'students',
        'students.grades',
        'students.grades.assignment',
        'students.grades.assignment.classroom',
      ],
    });

    if (!user) {
      throw new BadRequestException();
    }

    for (const student of user.students) {
      if (student.grades[0].assignment.classroom.id === classroomId) {
        return student.grades;
      }
    }
    throw new BadRequestException();
  }

  async checkIsTeacher(userId: string, classroomId: string) {
    const user = await this.usersRepo.findOneOrFail({
      where: { id: userId },
      relations: ['classrooms'],
    });

    for (const classroom of user.classrooms) {
      if (classroom.id === classroomId) {
        return;
      }
    }
    throw new UnauthorizedException();
  }

  async getReviews(userId: string, classroomId: string) {
    const classroom = await this.classesRepo.findOne(classroomId, {
      relations: ['teachers'],
    });

    if (!classroom) {
      throw new BadRequestException();
    }

    if (!classroom.teachers.find((teacher) => teacher.id === userId)) {
      throw new UnauthorizedException();
    }

    const reviews = await this.reviewsRepo
      .createQueryBuilder('review')
      .innerJoinAndSelect('review.grade', 'grade')
      .innerJoinAndSelect('grade.student', 'student')
      .innerJoinAndSelect('grade.assignment', 'assignment')
      .innerJoin('assignment.classroom', 'classroom')
      .where('classroom.id = :classroomId', { classroomId })
      .getRawMany();

    return reviews.map((review: any) => ({
      reviewId: review.review_id,
      assignmentName: review.assignment_name,
      identity: review.student_identity,
      fullName: review.student_fullName,
      currentGrade: review.grade_point,
      expectation: review.review_expectation,
      status: review.review_status,
    }));
  }

  async getReview(userId: string, classroomId: string, reviewId: string) {
    const classroom = await this.classesRepo.findOne(classroomId, {
      relations: ['teachers', 'students', 'students.user'],
    });

    const review = await this.reviewsRepo
      .createQueryBuilder('review')
      .innerJoin('review.grade', 'grade')
      .addSelect(['grade.point'])
      .innerJoin('grade.assignment', 'assignment')
      .addSelect(['assignment.name'])
      .innerJoin('grade.student', 'student')
      .addSelect(['student.identity', 'student.fullName'])
      .innerJoin('review.comments', 'comment')
      .innerJoin('comment.user', 'user')
      .addSelect([
        'comment.message',
        'user.fullName',
        'comment.createdAt',
        'user.id',
      ])
      .where('review.id = :reviewId', { reviewId })
      .getOne();

    if (!classroom || !review) {
      throw new NotFoundException();
    }

    const userIsATeacher = classroom.teachers.find(
      (teacher) => teacher.id === userId,
    );

    const userIsAStudent = classroom.students.find(
      (student) => student.user.id === userId,
    );

    if (!userIsAStudent && !userIsATeacher) {
      throw new ForbiddenException();
    }

    return review;
  }

  async closeReview(
    userId: string,
    classroomId: string,
    reviewId: string,
    dto: CloseReviewDto,
  ) {
    const { grade: point } = dto;
    const classroom = await this.classesRepo.findOne(classroomId, {
      relations: ['teachers', 'students', 'students.user'],
    });

    const review = await this.reviewsRepo.findOne(reviewId);

    const grade = await this.gradesRepo
      .createQueryBuilder('grade')
      .innerJoin('grade.review', 'review')
      .where('review.id = :reviewId', { reviewId })
      .getOne();

    if (!classroom || !review) {
      throw new NotFoundException();
    }

    const userIsATeacher = classroom.teachers.find(
      (teacher) => teacher.id === userId,
    );

    if (!userIsATeacher) {
      throw new ForbiddenException();
    }

    this.reviewsRepo.save({ ...review, status: ReviewStatus.RESOLVED });
    return this.gradesRepo.save({ ...grade, point });
  }
}
