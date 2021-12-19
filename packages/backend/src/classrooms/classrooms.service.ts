import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from 'src/entities/classroom.entity';
import { Student } from 'src/entities/student.entity';
import { Repository } from 'typeorm';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';

@Injectable()
export class ClassroomsService {
  // constructor(
  //   @InjectRepository(Classroom) private classroomsRepo: Repository<Classroom>,
  // ) {}
  create(createClassroomDto: CreateClassroomDto) {
    return 'This action adds a new classroom';
  }

  findAll() {
    return `This action returns all classrooms`;
  }

  findOne(id: number) {
    return `This action returns a #${id} classroom`;
  }

  update(id: number, updateClassroomDto: UpdateClassroomDto) {
    return `This action updates a #${id} classroom`;
  }

  remove(id: number) {
    return `This action removes a #${id} classroom`;
  }

  savestudentlist(workSheet: any, body:any){
    
    const ref =workSheet['!ref'];
    const array = ref.split(':');
    array[0]=array[0].replace('A','');
    array[1]=array[1].replace('B','');


    for(let i= parseInt(array[0]) + 1 ;i<=parseInt(array[1]);i++)
    {
      const studentId = workSheet[`A${i}`].v;
      const fullName = workSheet[`B${i}`].v;

      // ktra studentId trong classId co ton tai hay chua neu chua thi tao moi neu da ton tai thi bo qua

      // const student =new Student();
      // student.fullName=fullName;
      // student.identity=studentId;
      // student.grades=[];
      
    }
  }

  isFullAssignment( body: any){
    //tim assignment check is full true
  }
}
