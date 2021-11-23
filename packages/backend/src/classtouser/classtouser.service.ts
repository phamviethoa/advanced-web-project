import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ClassToUser } from './classtouser.entity';

@Injectable()
export class ClassesService {
    constructor(@InjectRepository(ClassToUser) private tasksRepo: Repository<ClassToUser>) {}
    async findAll(): Promise <ClassToUser[]> {
        return this.tasksRepo.find();
    }

    findOne(id: number) {
        return this.tasksRepo.findOne(id);
      }
    
    create(body: any) {
        const newClassToUser = new ClassToUser();
        newClassToUser.classid = body.classid;
        newClassToUser.userid = body.userid;
        newClassToUser.isstudent = body.isstudent;
        newClassToUser.participantid = body.participantid;
        return this.tasksRepo.save(newClassToUser);
    }
    
    async update(id: string, body: any) {
        const task = await this.tasksRepo.findOne(id);
        this.tasksRepo.merge(task, body);
        return this.tasksRepo.save(task);
    }
    
    async remove(id: string) {
        await this.tasksRepo.delete(id);
        return true;
    }
}
