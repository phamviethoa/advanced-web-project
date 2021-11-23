import { Controller, Post, Body, Get, Param, Put } from '@nestjs/common';
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneid(id);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }
}
