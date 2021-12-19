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
  ) {}
  async findAll(): Promise<Classroom[]> {
    return this.classesRepo.find();
  }

  findOne(id: string) {
    return this.classesRepo.findOneOrFail(id, {
      relations: ['teachers', 'students', 'assignments'],
    });
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

  async addStudent(email: string, identity: string, token: string) {
    console.log('Email: ', email);
    console.log('identity: ', identity);
    console.log('token: ', token);

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

    classroom.students = [newStudent];
    user.students = [newStudent];

    this.studentsRepo.save(newStudent);
    this.usersRepo.save(user);

    return await this.classesRepo.save(classroom);
  }

  async updateAssignments(
    id: string,
    updateAssignmentDto: UpdateAssignmentDto,
  ) {
    const classes = await this.classesRepo.findOneOrFail(id);

    const newAssignments: Assignment[] = [];

    const removedAssignments = await this.assignmentsRepo.find({
      classroom: classes,
    });

    this.assignmentsRepo.remove(removedAssignments);

    for (const assignment of updateAssignmentDto.assignments) {
      const newAssignment = this.assignmentsRepo.create(assignment);
      await this.assignmentsRepo.save(newAssignment);

      newAssignments.push(newAssignment);
    }

    classes.assignments = [...newAssignments];
    return this.classesRepo.save(classes);
  }

  async findAllwithteacher(teacherid: string): Promise<Classroom[]> {
    const classteacher = await this.usersRepo.find({
      relations: ['hostedClasses'],
      where: { id: teacherid },
    });
    return classteacher[0].classrooms;
  }

  async markFinalized(assignmentId: string) {
    const assignment =await this.assignmentsRepo.findOneOrFail({id: assignmentId});
    assignment.isFinalized =true;
    return this.assignmentsRepo.save(assignment);
  }

  downloadStudentListTemplate(res: any) {
    const filename = 'templatestudentlist.xlsx';
    return res.download('./src/classes/template/' + filename);
  }

  async savestudentlist(workSheet: any, classroomId:string){
    const ref =workSheet['!ref'];
    const array = ref.split(':');
    array[0]=array[0].replace('A','');
    array[1]=array[1].replace('B','');

    const classroom= await this.classesRepo.findOneOrFail({relations: ["students"],where:{id:classroomId}});
    const students = classroom.students;
    for(let i= parseInt(array[0]) + 1 ;i<=parseInt(array[1]);i++)
    {
      const studentId = workSheet[`A${i}`].v;
      const fullName = workSheet[`B${i}`].v;

      // ktra studentId trong classId co ton tai hay chua neu chua thi tao moi neu da ton tai thi bo qua
      var index = students.findIndex(x => x.identity == studentId); 
      console.log(index);
      if ( index === -1) {
        let newstudent = new Student()
        newstudent.classrooms=[classroom];
        newstudent.fullName=fullName;
        newstudent.identity=studentId;
        this.studentsRepo.save(newstudent);
      } else {
        console.log("object already exists")
      } 
    }
  }

  async saveAssignmentGrade(workSheet: any, assignmentid:string){
    const ref =workSheet['!ref'];
    const array = ref.split(':');
    array[0]=array[0].replace('A','');
    array[1]=array[1].replace('B','');

    const assignment= await this.assignmentsRepo.findOneOrFail({relations: ["classroom"],where:{id:assignmentid}})
    const students = assignment.classroom.students; // danh sach hoc sinh
    const grades = await this.gradetsRepo.find({assignment: assignment}) // danh sach diem

    for(let i= parseInt(array[0]) + 1 ;i<=parseInt(array[1]);i++) // duyet tung dòng excel
    {
      const studentId = workSheet[`A${i}`].v;
      const grade = workSheet[`B${i}`].v;

      var index = students.findIndex(x => x.identity == studentId); // vi tri neu co identity
      var index_grade = grades.findIndex(x=>x.student.identity== studentId)// vi tri neu co identity
      if ( index === -1) {
        console.log("khong ton tai sinh vien")
      } else {
        if (index_grade===-1) { //khong ton tai diem thi tao moi
          let newGrade = new Grade();
          newGrade.student=students[index];
          newGrade.assignment=assignment;
          newGrade.point=grade;
          this.gradetsRepo.save(newGrade);
        } else { // da ton tai diem thi chinh sua diem
          grades[index_grade].point=grade;
          this.gradetsRepo.save(grades[index_grade]);
        }
      } 
    }
  }

  async showstudentsgrades(classroomId: string){
    return await this.assignmentsRepo.find({relations:["grades", "grades.student", "classroom"],where:{classroom:{id:classroomId}}})
  }
}
