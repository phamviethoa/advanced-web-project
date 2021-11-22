import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
const bcrypt = require('bcrypt');

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async findOne(username: string): Promise<User | undefined> {
    return this.usersRepo.findOne({ where: { username } });
  }

  async checkUsernameIsExist(username: string): Promise<Boolean> {
    const users = await this.usersRepo.find({ where: { username } });
    return users.length === 0 ? true : false;
  }

  async addUser(username: string, fullName: string, password: string) {
    const isValid = await this.checkUsernameIsExist(username);

    if (!isValid) {
      throw new BadRequestException(`Username is existed!`);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = this.usersRepo.create({
      username,
      fullName,
      password: hashedPassword,
    });

    return this.usersRepo.save(newUser);
  }
}
