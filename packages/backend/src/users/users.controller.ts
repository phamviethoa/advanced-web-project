import { Controller, Post, Body, Get, Param, Put, Patch, UseGuards, Query, Request } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { SignupUserDto } from './dto/signup-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('/signup')
  signin(@Body() signupUserDto: SignupUserDto) {
    const { email, fullName, password } = signupUserDto;
    return this.usersService.sendActiveEmail(email, fullName, password);
  }

  @Post('/activate')
  active(
    @Query('token') token: string
  ) {
    return this.usersService.addUser(token);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOneid(id);
  }

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.usersService.update(id, body);
  }

  @Post('forgot-password')
  fogotpassword(@Body() body: any){
    return this.usersService.fogotpassword(body);
  }

  @Post('reset-password')
  restpassword(
    @Query('token') token: string,
    @Body() body: any
    ){
    const password = body.password;
    return this.usersService.newpassword(token,password);
  }
}
