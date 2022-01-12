import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Patch,
  UseGuards,
  Query,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { BanAccountByADminDTO } from './dto/banaccountbyadmin.dto';
import { MapStudentToUserByADminDTO } from './dto/mapstudenttouserbyadmin.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('/view-user-list-by-admin')
  viewUserList() {
    return this.usersService.viewUserList();
  }

  //@UseGuards(JwtAuthGuard)
  //@Get('/show-notifications')
  //showNotification(@Request() req: any){
  //const userId: string = req.user.id;
  //return this.usersService.showNotification(userId);
  //}

  @Get('/view-class-list-by-admin')
  viewClassListByAdmin() {
    return this.usersService.ViewClassListByAdmin();
  }

  @Get('/view-admin-list')
  viewAdminList() {
    return this.usersService.ViewAdminList();
  }

  @Post('/signup')
  signin(@Body() signupUserDto: SignupUserDto) {
    const { email, fullName, password } = signupUserDto;
    return this.usersService.sendActiveEmail(email, fullName, password);
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

  @Post('/activate')
  active(@Query('token') token: string) {
    return this.usersService.addUser(token);
  }

  @Post('forgot-password')
  fogotpassword(@Body() body: any) {
    return this.usersService.fogotpassword(body);
  }

  @Post('reset-password')
  restpassword(@Query('token') token: string, @Body() body: any) {
    const password = body.password;
    return this.usersService.newpassword(token, password);
  }

  @Post('/create-account-admin')
  createAccountAdmin(@Body() body: SignupUserDto) {
    const { email, fullName, password } = body;
    return this.usersService.CreateAccountAdmin(email, fullName, password);
  }

  @Get('/view-detail-admin/:adminId')
  viewDetailAdmin(@Param('adminId') adminId: string) {
    return this.usersService.ViewDetailAdmin(adminId);
  }

  @Get('/view-detail-class-by-admin/:classroomId')
  viewDetailClassByAdmin(@Param('classroomId') classroomId: string) {
    return this.usersService.ViewDetailClassByAdmin(classroomId);
  }

  @Get('/view-detail-user-by-admin/:userId')
  viewDetailUserByAdmin(@Param('userId') userId: string) {
    return this.usersService.viewDetailUserByAdmin(userId);
  }

  @Post('/ban-unban-account-by-admin')
  banUnnamAccountByAdmin(@Body() body: BanAccountByADminDTO) {
    return this.usersService.banUnnamAccountByAdmin(body.accountId);
  }

  @Post('map-student-to-user-by-admin')
  mapStudentToUserByAdmin(body: MapStudentToUserByADminDTO) {
    return this.usersService.MapStudentToUserByAdmin(
      body.studentId,
      body.userId,
    );
  }

  @Post('unmap-student-to-user-by-admin')
  unmapStudentToUserByAdmin(body: MapStudentToUserByADminDTO) {
    return this.usersService.unMapStudentToUserByAdmin(
      body.studentId,
      body.userId,
    );
  }
}
