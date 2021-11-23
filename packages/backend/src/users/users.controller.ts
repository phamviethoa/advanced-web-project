import { Controller, Post, Body } from '@nestjs/common';
import { SignupUserDto } from './dto/signup-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  signin(@Body() signupUserDto: SignupUserDto) {
    const { email, fullName, password } = signupUserDto;
    return this.usersService.addUser(email, fullName, password);
  }
}
