import {
  BadRequestException,
  Injectable,
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
import { throwError } from 'rxjs';
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

@Injectable()
export class ClassroomsService {
  constructor(
    @InjectRepository(Classroom) private classesRepo: Repository<Classroom>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Student) private studentsRepo: Repository<Student>,
    @InjectRepository(Assignment)
    private assignmentsRepo: Repository<Assignment>,
    @InjectRepository(Grade) private gradetsRepo: Repository<Grade>,
    private jwtService: JwtService,
    @InjectRepository(Notification)
    private notificationsRepo: Repository<Notification>,
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
    const userIsTeacher = await this.usersRepo.findOneOrFail({
      where: { id: userid },
      relations: ['classrooms'],
    });
    return userIsTeacher.classrooms;
  }

  async findAllClassIsStudent(userid: string) {
    const userfind = await this.usersRepo.findOneOrFail(userid);
    const students = await this.studentsRepo.findOneOrFail({
      where: { user: userfind },
      relations: ['classrooms'],
    });
    return students.classrooms;
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

    newStudent.classrooms = [classroom];
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
        newstudent.classrooms = [classroom];
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
    const grades = await this.gradetsRepo.find({
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
          await this.gradetsRepo.save(newGrade);
        } else {
          // da ton tai diem thi chinh sua diem
          grades[index_grade].point = grade;
          await this.gradetsRepo.save(grades[index_grade]);
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

    const grade = await this.gradetsRepo.findOne({
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
      return await this.gradetsRepo.save(newGrade);
    } else {
      grade.point = body.point;
      return await this.gradetsRepo.save(grade);
    }
  }

  async exprotgradeboard(userId: string, classroomId: string, res: any) {
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

  //async requestReviewGrade(body: ReviewGradelDTO, studentId: string) {
  //const classroomId = body.classroomId;
  //const gradeNeedToRivewId = body.gradeNeedToRivewId;
  //const expectationGrade = body.expectationGrade;
  //const description = body.description;

  //const classroom = await this.classesRepo.findOne({
  //relations: ['teachers'],
  //where: { id: classroomId },
  //});
  //const grade = await this.gradetsRepo.findOne(gradeNeedToRivewId);
  //const student = await this.usersRepo.findOne(studentId);

  //if (!classroom || !grade || !student) {
  //throw new BadRequestException();
  //}

  //const notification = new Notification();

  //notification.expectationGrade = expectationGrade;
  //notification.description = description;
  //notification.gradeNeedToRivew = grade;
  //notification.toUser = classroom.teachers;
  //notification.fromUser = student;

  //// await this.classesRepo.save(classroom);
  //// await this.gradetsRepo.save(grade);
  //// await this.usersRepo.save(student);
  //const newnotification = this.notificationsRepo.create(notification);
  //return await this.notificationsRepo.save(newnotification);
  //}

  //async commentStudentReview(body: CommentReviewDTO, fromUserId: string) {
  //const description = body.description;
  //const toUserId = body.toUserId;
  //const fromUser = await this.usersRepo.findOne(fromUserId);
  //const toUser = await this.usersRepo.findOne(toUserId);

  //if (!fromUser || !toUser) {
  //throw new BadRequestException();
  //}
  //const notification = new Notification();
  //notification.fromUser = fromUser;
  //notification.toUser = [toUser];
  //notification.description = description;

  //const newnotification = this.notificationsRepo.create(notification);
  //return await this.notificationsRepo.save(newnotification);
  //}

  //async viewOfStudentCommentsGradeReview(body: ViewOfStudentCommentsDTO) {
  //const gradeNeedToRivewId = body.gradeNeedToRivewId;
  //const grade = await this.gradetsRepo.findOne({
  //relations: ['reviews', 'reviews.fromUser', 'reviews.toUser'],
  //where: { id: gradeNeedToRivewId },
  //});

  //if (!grade) {
  //throw new BadRequestException();
  //}
  //return grade;
  //}

  //async viewListOfGradeReviewsRequestByStudent(teacherId: string) {
  //const teacher = await this.usersRepo.findOne({
  //relations: [
  //'notificationsReceived',
  //'notificationsReceived.fromUser',
  //'notificationsReceived.gradeNeedToRivew',
  //],
  //where: { id: teacherId },
  //});

  //if (!teacher) {
  //throw new BadRequestException();
  //}

  //let notifications: Notification[] = [];
  //for (const notification of teacher.notificationsReceived) {
  //if (!notification.gradeNeedToRivew) {
  //} else {
  //notifications.push(notification);
  //}
  //}
  //return notifications;
  //}

  //async markFinalforStudentReviewUpdateGrade(
  //body: FinalizedReviewDTO,
  //teacherId: string,
  //) {
  //const grade = await this.gradetsRepo.findOne(body.gradeNeedToUpdateId);
  //const teacher = await this.usersRepo.findOne(teacherId);
  //const student = await this.usersRepo.findOne(body.studenitId);

  //if (!grade || !teacher || student) {
  //throw new BadRequestException();
  //}
  //grade.isFinalized = true;
  //grade.point = body.newPoint;

  //const notification = new Notification();
  //notification.fromUser = teacher;
  //notification.toUser = [student];
  //notification.description = 'Giáo viên đã hoàn tất việc cập nhật điểm';

  //const newnotification = this.notificationsRepo.create(notification);
  //await this.notificationsRepo.save(newnotification);

  //return await this.gradetsRepo.save(grade);
  //}

  //async teacherViewGradeDetail(notificationId: string) {
  //const notification = this.notificationsRepo.findOne({
  //where: { id: notificationId },
  //relations: [
  //'gradeNeedToRivew',
  //'gradeNeedToRivew.assignment',
  //'toUser',
  //'fromUser',
  //],
  //});
  //if (!notification) {
  //throw new BadRequestException();
  //}
  //return notification;
  //}

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

    console.log('user: ', user);

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
}
