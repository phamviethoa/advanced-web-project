import { BadRequestException, Injectable, Response } from '@nestjs/common';
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
import { async, throwError } from 'rxjs';
import { Max } from 'class-validator';

@Injectable()
export class ClassroomsService {
  constructor(
    @InjectSendGrid() private readonly sendGrid: SendGridService,
    @InjectRepository(Classroom) private classesRepo: Repository<Classroom>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Student) private studentsRepo: Repository<Student>,
    @InjectRepository(Assignment)
    private assignmentsRepo: Repository<Assignment>,
    @InjectRepository(Grade) private gradetsRepo: Repository<Grade>,
    private jwtService: JwtService,
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

  async findAllClassIsTeacher(userid: string){
    const userIsTeacher = await this.usersRepo.findOneOrFail({where:{id:userid},relations:["classrooms"]});
    return userIsTeacher.classrooms;
  }

  async findAllClassIsStudent(userid: string){
    const userfind= await this.usersRepo.findOneOrFail(userid);
    const students = await this.studentsRepo.findOneOrFail({where:{user: userfind},relations:["classrooms"]});
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

  async getInviteStudentLink(id: string) {
    const payload = {
      classId: id,
    };

    const token = this.jwtService.sign(payload);

    return `${process.env.FRONT_END_URL}/class/add-student-by-link?token=${token}`;
  }

  async getInviteTeacherLink(id: string) {
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
    for (const assignmentFE of AssignmentDtoFE.assignments){}

    let indexfe = 0;
    for (const assignmentFE of AssignmentDtoFE.assignments){
      for (const dbassignment of DBAssignments){
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
    return  await this.assignmentsRepo.find({
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

  async markFinalized(assignmentId: string) {
    const assignment = await this.assignmentsRepo.findOneOrFail({
      where: { id: assignmentId },
      relations: ['classroom', 'classroom.students'],
    });
    const gradesofassignement = await this.gradetsRepo.findAndCount({
      assignment: assignment,
    });
    const countstudentinclassroom = assignment.classroom.students.length;
    if (gradesofassignement[1] === countstudentinclassroom) {
      assignment.isFinalized = true;
      return await this.assignmentsRepo.save(assignment);
    }
    throw new BadRequestException('Grades in assignement is not finalized');
  }

  downloadStudentListTemplate(res: any) {
    const filename = 'templatestudentlist.xlsx';
    return res.download('./src/classes/template/' + filename);
  }

  async savestudentlist(workSheet: any, classroomId: string) {
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

  async saveAssignmentGrade(workSheet: any, assignmentid: string) {
    const ref = workSheet['!ref'];
    const array = ref.split(':');
    array[0] = array[0].replace('A', '');
    array[1] = array[1].replace('B', '');

    const assignment = await this.assignmentsRepo.findOneOrFail({
      relations: ['classroom', 'classroom.students'],
      where: { id: assignmentid },
    });

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
        console.log('khong ton tai sinh vien');
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

  async showstudentsgrades(classroomId: string) {
    return await this.assignmentsRepo.find({
      relations: ['grades', 'grades.student', 'classroom'],
      where: { classroom: { id: classroomId } },
    });
  }

  async inputGradeStudentAssignment(body: UpdateGradeDTO) {
    const assignment = await this.assignmentsRepo.findOne(body.assignmentId);
    const student = await this.studentsRepo.findOne(body.studentId);

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

  async exprotgradeboard(classroomId: string, res: any) {
    const assignmentsgradesofstudent = await this.showstudentsgrades(
      classroomId,
    );
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

  async inviteStudentByEmail(classroomId: string, body: InviteByEmailDTO) {
    const linkInviteByEmail = await this.getInviteStudentLink(classroomId);
    try {
      return this.sendGrid.send({
        to: body.email,
        from: process.env.FROM_EMAIL,
        subject: 'Link tham gia lớp học cho học sinh',
        text: `Xin chào`,
        html: `<a href= ${linkInviteByEmail}>link tham gia lớp học</a>`,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
  async inviteTeacherByEmail(classroomId: string, body: InviteByEmailDTO) {
    const linkInviteByEmail = await this.getInviteTeacherLink(classroomId);
    try {
      return this.sendGrid.send({
        to: body.email,
        from: process.env.FROM_EMAIL,
        subject: 'Link tham gia lớp học cho giáo viên',
        text: `Xin chào`,
        html: `<a href= ${linkInviteByEmail}>link tham gia lớp học</a>`,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }
}
