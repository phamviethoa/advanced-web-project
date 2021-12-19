import { Injectable } from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';

@Injectable()
export class StudentsService {
  mappingstudentId(body: any){
    // lay ra danh sach toan bo users so sanh voi email neu co thi gan User vao cho student co studentId trong classroomId 
  }

  findAllStudentandGrade(classroomId: string){
    // dung classroomId lay ra tat ca assignment va toan bo studentId voi cac thuoc tinh Grade
  }

  calTotalGrade(classroomId: string){
    //  dung classroomId lay ra tat ca assignment va toan bo studentId voi cac thuoc tinh Grade
    // duyet tung student Id sum 
    // xuat ra studentId va totalGrade
  }

  create(createStudentDto: CreateStudentDto) {
    return 'This action adds a new student';
  }

  findAll() {
    return `This action returns all students`;
  }

  findOne(id: number) {
    return `This action returns a #${id} student`;
  }

  update(id: number, updateStudentDto: UpdateStudentDto) {
    return `This action updates a #${id} student`;
  }

  remove(id: number) {
    return `This action removes a #${id} student`;
  }
}
