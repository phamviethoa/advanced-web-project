import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
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
    return 'This action adds a new assignment';
  }

  findAll() {
    return `This action returns all assignments`;
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
