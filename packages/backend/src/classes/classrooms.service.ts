import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
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
import { utils, writeFile } from 'xlsx';
import { InviteByEmailDTO } from './dto/invite-by-email-dto';
import { Notification } from 'src/entities/notification.entity';
import { MailerService } from '@nestjs-modules/mailer';
import { GradeReview, ReviewStatus } from 'src/entities/grade-review.entity';
import { CloseReviewDto } from './dto/close-review.dto';
import { NotificationsService } from 'src/notifications/notifications.service';
import notificationTemplate from 'src/notifications/notification-template';
import { AuthorizationService } from 'src/authorization/authorization.service';
import { async } from 'rxjs';
const shortid = require('shortid');

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
    private readonly notificationsService: NotificationsService,
    private readonly authorizationService: AuthorizationService,
  ) {}
  async findAll(): Promise<Classroom[]> {
    return this.classesRepo.find();
  }

  // OK
  async findOne(userId: string, id: string) {
    const isTeacher = await this.authorizationService.isTeacher(userId, id);
    const isStudent = await this.authorizationService.isStudent(userId, id);
    const isAdmin = await this.authorizationService.isAdmin(userId);

    if (!isTeacher && !isStudent && !isAdmin) {
      throw new ForbiddenException();
    }

    const classroom = await this.classesRepo.findOne(id, {
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

    if (!classroom) {
      throw new NotFoundException();
    }

    return classroom;
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
    const teacher = await this.usersRepo.findOne(teacherId);

    if (!teacher) {
      throw new ForbiddenException();
    }

    const code = shortid.generate();

    const newClasses = this.classesRepo.create(createClassDto);
    newClasses.teachers = [teacher];

    return this.classesRepo.save({ ...newClasses, code });
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
    //await this.checkIsTeacher(userId, id);

    const isTeacher = await this.authorizationService.isTeacher(userId, id);

    if (!isTeacher) {
      throw new ForbiddenException();
    }

    const payload = {
      classId: id,
    };

    const token = this.jwtService.sign(payload);

    return `${process.env.FRONT_END_URL}/class/add-student-by-link?token=${token}`;
  }

  async getManagedClassrooms(userId: string) {
    const isAdmin = await this.authorizationService.isAdmin(userId);

    if (!isAdmin) {
      throw new ForbiddenException();
    }

    const classes = await this.classesRepo
      .createQueryBuilder('class')
      .leftJoinAndSelect('class.teachers', 'teacher')
      .leftJoinAndSelect('class.students', 'student')
      .getMany();

    return classes;
  }

  async getInviteTeacherLink(userId: string, id: string) {
    //await this.checkIsTeacher(userId, id);

    const isTeacher = await this.authorizationService.isTeacher(userId, id);

    if (!isTeacher) {
      throw new ForbiddenException();
    }

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

  async updateAssignments(
    userId: string,
    id: string,
    dto: UpdateAssignmentDto,
  ) {
    const { assignments } = dto;
    const isTeacher = await this.authorizationService.isTeacher(userId, id);

    if (!isTeacher) {
      throw new ForbiddenException();
    }

    const classroom = await this.classesRepo.findOne(id);

    const savedAssignments = await this.assignmentsRepo
      .createQueryBuilder('assignment')
      .innerJoin('assignment.classroom', 'classroom')
      .where('classroom.id = :id', { id })
      .getMany();

    if (!classroom || !savedAssignments) {
      throw new NotFoundException();
    }

    // Delete
    savedAssignments.forEach((savedAssignment) => {
      if (
        !assignments.find((assignment) => assignment.id === savedAssignment.id)
      ) {
        this.assignmentsRepo.delete(savedAssignment.id);
      }
    });

    // Add
    for (const [index, assignment] of assignments.entries()) {
      if (assignment.id === '') {
        const newAssignment = this.assignmentsRepo.create({
          name: assignment.name,
          maxPoint: assignment.maxPoint,
          order: index + 1,
          classroom,
        });

        this.assignmentsRepo.save(newAssignment);
      }
    }

    // Update
    const updatedAssignments = assignments.filter(
      (assignment) => assignment.id !== '',
    );
    for (const [index, updatedAssignment] of updatedAssignments.entries()) {
      const assignment = await this.assignmentsRepo.findOne(
        updatedAssignment.id,
      );
      await this.assignmentsRepo.save({
        ...assignment,
        order: index + 1,
        name: updatedAssignment.name,
        maxPoint: updatedAssignment.maxPoint,
      });
    }

    return true;
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

    const isTeacher = await this.authorizationService.isTeacher(
      teacherId,
      classroom.id,
    );

    if (!isTeacher) {
      throw new ForbiddenException();
    }

    const students = await this.studentsRepo
      .createQueryBuilder('student')
      .innerJoin('student.classroom', 'classroom')
      .innerJoin('classroom.assignments', 'assignment')
      .innerJoinAndSelect('student.user', 'user')
      .where('assignment.id = :assignmentId', { assignmentId })
      .getMany();

    if (!teacher || !assignment) {
      throw new NotFoundException();
    }

    if (!classroom.teachers.find((teacher) => teacher.id === teacherId)) {
      throw new UnauthorizedException();
    }

    students.forEach((student) => {
      this.notificationsService.addNotification(
        teacher.fullName,
        student.user.id,
        notificationTemplate.finalizeAGradeComposition(
          assignment.name,
          classroom.subject,
        ),
        `${process.env.FRONT_END_URL}/class/${classroom.id}`,
      );
    });

    return this.assignmentsRepo.save({
      ...assignment,
      isFinalized: true,
    });
  }

  downloadStudentListTemplate(res: any) {
    const filename = 'templatestudentlist.xlsx';
    return res.download('./src/classes/template/' + filename);
  }

  async savestudentlist(userId: string, workSheet: any, classroomId: string) {
    const isTeacher = await this.authorizationService.isTeacher(
      userId,
      classroomId,
    );

    if (!isTeacher) {
      throw new ForbiddenException();
    }

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
      if (index === -1) {
        let newstudent = new Student();
        newstudent.classroom = classroom;
        newstudent.fullName = fullName;
        newstudent.identity = studentId;
        await this.studentsRepo.save(newstudent);
      } else {
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

    //await this.checkIsTeacher(userId, assignment.classroom.id);

    const isTeacher = await this.authorizationService.isTeacher(
      userId,
      assignment.classroom.id,
    );

    if (!isTeacher) {
      throw new ForbiddenException();
    }

    const students = assignment.classroom.students; // danh sach hoc sinh
    const grades = await this.gradesRepo.find({
      where: { assignment: assignment },
      relations: ['student'],
    }); // danh sach diem
    for (
      let i = parseInt(array[0]) + 1;
      i <= parseInt(array[1]);
      i++ // duyet tung dòng excel
    ) {
      const studentId = workSheet[`A${i}`].v;
      const grade = workSheet[`B${i}`].v;

      var index = students.findIndex((x) => x.identity == studentId); // vi tri neu co identity
      var index_grade = grades.findIndex(
        (x) => x.student.identity == studentId,
      ); // vi tri neu co identity
      if (index === -1) {
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

    const isTeacher = await this.authorizationService.isTeacher(
      userId,
      assignment.classroom.id,
    );

    if (!isTeacher) {
      throw new ForbiddenException();
    }

    if (!assignment || !student) {
      return new NotFoundException();
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
    const isTeacher = await this.authorizationService.isTeacher(
      userId,
      classroomId,
    );

    if (!isTeacher) {
      throw new ForbiddenException();
    }

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
    const isTeacher = await this.authorizationService.isTeacher(
      userId,
      classroomId,
    );

    if (!isTeacher) {
      throw new ForbiddenException();
    }

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
      .leftJoin('review.comments', 'comment')
      .leftJoin('comment.user', 'user')
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

    const isTeacher = await this.authorizationService.isTeacher(
      userId,
      classroomId,
    );
    const isStudent = await this.authorizationService.isStudent(
      userId,
      classroomId,
    );

    if (!isTeacher && !isStudent) {
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

    const teacher = await this.usersRepo.findOne(userId);
    const student = await this.studentsRepo
      .createQueryBuilder('student')
      .innerJoin('student.grades', 'grade')
      .innerJoin('student.user', 'user')
      .addSelect(['user.id'])
      .innerJoin('grade.review', 'review')
      .where('review.id = :reviewId', { reviewId })
      .getOne();

    const assignment = await this.assignmentsRepo
      .createQueryBuilder('assignment')
      .innerJoin('assignment.grades', 'grade')
      .innerJoin('grade.review', 'review')
      .where('review.id = :reviewId', { reviewId })
      .getOne();

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

    this.notificationsService.addNotification(
      teacher.fullName,
      student.user.id,
      notificationTemplate.markFinalGrade(assignment.name, classroom.subject),
      `${process.env.FRONT_END_URL}/class/${classroom.id}/review/${reviewId}`,
    );

    this.reviewsRepo.save({ ...review, status: ReviewStatus.RESOLVED });
    return this.gradesRepo.save({ ...grade, point });
  }
}
