import { Injectable } from '@nestjs/common';
import { CreateGradeDto } from './dto/create-grade.dto';
import { UpdateGradeDto } from './dto/update-grade.dto';

@Injectable()
export class GradesService {

  saveAssignmentGrade(workSheet, body){

    const ref =workSheet['!ref'];
    const array = ref.split(':');
    array[0]=array[0].replace('A','');
    array[1]=array[1].replace('B','');


    for(let i= parseInt(array[0]) + 1 ;i<=parseInt(array[1]);i++)
    {
      const studentId = workSheet[`A${i}`].v;
      const grade = workSheet[`B${i}`].v;

      // ktra studentId trong classId co ton tai hay chua neu chua thi tao moi neu da ton tai thi bo qua
     
    }
  }
  
  inputgrade1student1assignment(body: any){
    // khởi tạo assignment va student và grade nếu đã tồn tại thì thay đổi grade
  }

  create(createGradeDto: CreateGradeDto) {
    return 'This action adds a new grade';
  }

  findAll() {
    return `This action returns all grades`;
  }

  findOne(id: number) {
    return `This action returns a #${id} grade`;
  }

  update(id: number, updateGradeDto: UpdateGradeDto) {
    return `This action updates a #${id} grade`;
  }

  remove(id: number) {
    return `This action removes a #${id} grade`;
  }
}
