import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>) {}

  async checkUsernameIsExist(username: string): Promise<Boolean> {
    const user = await this.usersRepo.find({ where: { username } });

    return user ? false : true;
  }

  async addUser(username: string, password: string) {
    const isValid = await this.checkUsernameIsExist(username);

    if (!isValid) {
      throw new BadRequestException(`Username is existed!`);
    }

    const saltOrRounds = 10;
    const hash = bcrypt.hashSync(password, saltOrRounds);

    const newUser = this.usersRepo.create({ username, password: hash });

    return this.usersRepo.save(newUser);
  }
}
