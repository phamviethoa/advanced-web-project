import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { UsersService } from 'src/users/users.service';
const bcrypt = require('bcrypt');

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async isMatchPassword(user: User, password: string): Promise<boolean> {
    const { password: hashedPassword } = user;

    return await bcrypt.compare(password, hashedPassword);
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findOne(email);
    const isCorrectPassword = await this.isMatchPassword(user, password);

    if(user.isBanned===true)
    {
      throw new BadRequestException(`User is banned`);
    }

    if (user && isCorrectPassword) {
      const { password, ...info } = user;

      return info;
    }

    return null;
  }

  async login(user: User) {
    const payload = {
      name: user.fullName,
      sub: user.id,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
