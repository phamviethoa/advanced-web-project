import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classes } from './class.entity';
import { UsersService } from 'src/users/users.service';
import { StudentToClass } from 'src/student-to-class/student-to-class.entity';
import { StudentToClassService } from 'src/student-to-class/student-to-class.service';
import { Assignment } from './assignment.entity';
import { UpdateAssignmentDto } from './dto/update-assignments.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { User } from 'src/users/user.entity';

@Injectable()
export class ClassesService {
  constructor(
    @InjectRepository(Classes) private classesRepo: Repository<Classes>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Assignment)
    private assignmentsRepo: Repository<Assignment>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    private jwtService: JwtService,
    private usersService: UsersService,
    private studentToClassService: StudentToClassService,
  ) {}
  async findAll(): Promise<Classes[]> {
    return this.classesRepo.find();
  }

  findOne(id: number) {
    return this.classesRepo.findOne(id, {
      relations: ['teachers', 'studentToClass', 'assignments'],
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
    const payload = this.jwtService.verify(token);
    const classId = payload.classId;

    const classroom = await this.classesRepo.findOne(classId);
    const student = await this.usersService.findOne(email);

    if (!classroom || !student) {
      throw new BadRequestException();
    }

    const studentToClass = new StudentToClass();
    studentToClass.identity = identity;
    studentToClass.classId = classId;
    studentToClass.studentId = student.id;

    return await this.studentToClassService.save(studentToClass);
  }

  async updateAssignments(
    id: string,
    updateAssignmentDto: UpdateAssignmentDto,
  ) {
    const classes = await this.classesRepo.findOneOrFail(id);

    const newAssignments: Assignment[] = [];

    const removedAssignments = await this.assignmentsRepo.find({
      class: classes,
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

  async  findAllwithteacher(teacherid: string): Promise<Classes[]> {
    const classteacher= await this.userRepo.find({relations:["hostedClasses"],where:{id:teacherid}});
    return classteacher[0].hostedClasses;
  }

  async  findAllwithstudent(studentid: string): Promise<Classes[]> {
    let classstudent:Classes[]=[];
    const studenttoclasslist =await this.studentToClassService.findAllClasspartici(studentid);
    for(const studenttoclass of studenttoclasslist)
    {
      classstudent.push(studenttoclass.class);
    }
    return classstudent;
  }
}
