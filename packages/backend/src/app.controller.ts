import {
  Controller,
  Request,
  Post,
  UseGuards,
  Get,
  Body,
} from '@nestjs/common';
import { LocalAuthGuard } from './auth/local-auth.guard';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  hello() {
    return 'Deploy Successfully';
  }

  @UseGuards(LocalAuthGuard)
  @Post('/auth/validate')
  login(@Request() req: any): any {
    return req.user;
  }

  // OK
  @Post('/auth/facebook')
  facebookLogin(@Body() body: any) {
    const { email, id, name } = body;
    return this.usersService.loginByFacebook(email, id, name);
  }
}
