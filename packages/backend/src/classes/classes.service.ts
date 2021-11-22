import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Classes } from './class.entity';

@Injectable()
export class ClassesService {
    constructor(@InjectRepository(Classes) private tasksRepo: Repository<Classes>) {}
    async findAll(): Promise <Classes[]> {
        return this.tasksRepo.find();
    }

    findOne(id: number) {
        return this.tasksRepo.findOne(id);
      }
    
    create(body: any) {
        const newClasses = new Classes();
        newClasses.subject = body.subject;
        newClasses.description = body.description;
        return this.tasksRepo.save(newClasses);
    }
    
    async update(id: number, body: any) {
        const task = await this.tasksRepo.findOne(id);
        this.tasksRepo.merge(task, body);
        return this.tasksRepo.save(task);
    }
    
    async remove(id: number) {
        await this.tasksRepo.delete(id);
        return true;
    }
}
