import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Classes } from 'src/classes/class.entity';
import { Repository } from 'typeorm';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { Assignment } from './entities/assignment.entity';

@Injectable()
export class AssignmentsService {
  constructor(
    @InjectRepository(Assignment)
    private assignmentsRepo: Repository<Assignment>,
  ) {}

  create(createAssignmentDto: CreateAssignmentDto) {
    const newwassignment=new Assignment();
    newwassignment.name=createAssignmentDto.name;
    newwassignment.point=createAssignmentDto.point;
    newwassignment.order=createAssignmentDto.order;
    
    const newclass = new Classes();
    newclass.id=createAssignmentDto.classid;
    newwassignment.class=newclass;
    console.log(newwassignment);
    //return 'This action adds a new assignment';
    return this.assignmentsRepo.save(newwassignment);
  }

  findAll() {
    return this.assignmentsRepo.find({ relations: ["class"] });
  }

  async findAllInClass(idclass: string):Promise<Assignment[]> {
    const assignmentinclass= this.assignmentsRepo.find({ 
      relations: ["class"],
      where:{
        class:{
          id:idclass
    }}});
    return assignmentinclass;
  }

  findOne(id: number) {
    return `This action returns a #${id} assignment`;
  }

  async update(id: number, updateAssignmentDto: UpdateAssignmentDto) {
    const assignment = await this.assignmentsRepo.findOneOrFail(id);

    if (!assignment) {
      throw new NotFoundException();
    }

    const updated = this.assignmentsRepo.merge(assignment, updateAssignmentDto);

    return this.assignmentsRepo.save(updated);
  }

  remove(id: number) {
    return `This action removes a #${id} assignment`;
  }
}
