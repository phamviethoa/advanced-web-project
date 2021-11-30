import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Classes } from 'src/classes/class.entity';
import { Repository } from 'typeorm';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAllAssignmentDto } from './dto/update-allassignment.dto';
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
    return this.assignmentsRepo.save(newwassignment);
  }

  findAll() {
    return this.assignmentsRepo.find({ relations: ["class"], order: {
      order: "ASC",
    }, });
  }

  async findAllInClass(idclass: string):Promise<Assignment[]> {
    const assignmentinclass= this.assignmentsRepo.find({ 
      relations: ["class"],
      order: {
        order: "ASC",
      },
      where:{
        class:{
          id:idclass
    }}});
    return assignmentinclass;
  }

  findOne(id: string) {
    return this.assignmentsRepo.findOne({relations: ["class"], where: { id } });
  }

  async update(id: string, updateAssignmentDto: UpdateAssignmentDto) {
    const assignment = await this.assignmentsRepo.findOneOrFail(id);

    if (!assignment) {
      throw new NotFoundException();
    }

    const updated = this.assignmentsRepo.merge(assignment, updateAssignmentDto);

    return this.assignmentsRepo.save(updated);
  }

  async remove(id: string) {
    return await this.assignmentsRepo.delete(id);
  }

  async updateallassignments(updateAssignmentDtos: UpdateAllAssignmentDto[]) {
    const updateAssignmens = updateAssignmentDtos.forEach(async updateAssignmentDto => {
      const assignment = await this.assignmentsRepo.findOneOrFail(updateAssignmentDto.id);

      if (!assignment) {
        throw new NotFoundException();
      }

      const updated = this.assignmentsRepo.merge(assignment, updateAssignmentDto);
      this.assignmentsRepo.save(updated);
   });
   return updateAssignmens;
  }
}
