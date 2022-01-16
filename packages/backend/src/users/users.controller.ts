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
  Delete,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CreateAdminDto } from './dto/add-admin.dto';
import { BanAccountByADminDTO } from './dto/banaccountbyadmin.dto';
import { MapStudentToUserByADminDTO } from './dto/mapstudenttouserbyadmin.dto';
import { SignupUserDto } from './dto/signup-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  getAll(@Request() req: any) {
    const userId = req.user.id;
    return this.usersService.getAll(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/ban-user')
  banUser(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.usersService.banUser(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/unban-user')
  unbanUser(@Request() req: any, @Param('id') id: string) {
    const userId = req.user.id;
    return this.usersService.unbanUser(userId, id);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  removeUser(@Request() req: any, @Param('id') id: string) {
    console.log('HEREEEE');
    const userId = req.user.id;
    return this.usersService.remove(userId, id);
  }

  @Get('/view-user-list-by-admin')
  viewUserList() {
    return this.usersService.viewUserList();
  }

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

  @UseGuards(JwtAuthGuard)
  @Post('/create-account-admin')
  createAccountAdmin(@Request() req: any, @Body() body: CreateAdminDto) {
    const userId = req.user.id;
    return this.usersService.CreateAccountAdmin(userId, body);
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

  @Get('mappable/:classroomId')
  @UseGuards(JwtAuthGuard)
  getMappableUsers(
    @Request() req: any,
    @Param('classroomId') classroomId: string,
  ) {
    const userId = req.user.id;
    return this.usersService.getMappableUsers(userId, classroomId);
  }
}
