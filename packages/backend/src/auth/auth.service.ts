import { Injectable } from '@nestjs/common';
import { User } from 'src/users/user.entity';
import { UsersService } from 'src/users/users.service';
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async isMatchPassword(user: User, password: string): Promise<boolean> {
    const { password: hashedPassword } = user;

    return await bcrypt.compare(password, hashedPassword);
  }

  async validateUser(username: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    const isCorrectPassword = await this.isMatchPassword(user, password);

    if (user && isCorrectPassword) {
      const { username, password, ...info } = user;

      return info;
    }

    return null;
  }
}
