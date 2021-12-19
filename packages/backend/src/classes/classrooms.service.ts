import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateAssignmentDto } from './dto/update-assignments.dto';
import { CreateClassDto } from './dto/create-class.dto';
import { Classroom } from 'src/entities/classroom.entity';
import { User } from 'src/entities/user.entity';
import { Assignment } from 'src/entities/assignment.entity';
import { Student } from 'src/entities/student.entity';

@Injectable()
export class ClassroomsService {
  constructor(
    @InjectRepository(Classroom) private classesRepo: Repository<Classroom>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Student) private studentsRepo: Repository<Student>,
    @InjectRepository(Assignment)
    private assignmentsRepo: Repository<Assignment>,
    private jwtService: JwtService,
  ) {}
  async findAll(): Promise<Classroom[]> {
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
    const student = await this.studentsRepo.findOne({ identity });

    if (!classroom || !student) {
      throw new BadRequestException();
    }

    classroom.students = [student];

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
}
