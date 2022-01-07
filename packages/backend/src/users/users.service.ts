import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
import { createTransport } from 'nodemailer';
import { throwError } from 'rxjs';
const bcrypt = require('bcrypt');

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private usersRepo: Repository<User>,
  private jwtService: JwtService,) {}

  async findOne(email: string): Promise<User | undefined> {
    return await this.usersRepo.findOne({ where: { email } });
  }

  async findOneid(id: string): Promise<User | undefined> {
    return this.usersRepo.findOne({ where: { id } });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepo.find();
  }

  async checkUsernameIsExist(email: string): Promise<Boolean> {
    const users = await this.usersRepo.find({ where: { email } });
    return users.length === 0 ? true : false;
  }

  async addUser(token: any) {
    const payload = this.jwtService.verify(token);
    const email = payload.email;
    const fullName = payload.fullName;
    const password = payload.password;
    const isValid = await this.checkUsernameIsExist(email);

    if (!isValid) {
      throw new BadRequestException(`Email is existed!`);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = this.usersRepo.create({
      email,
      fullName,
      password: hashedPassword,
    });

    return this.usersRepo.save(newUser);
  }

  async update(id: string, body: any) {
    const task = await this.usersRepo.findOne(id);
    this.usersRepo.merge(task, body);
    return await this.usersRepo.save(task);
  }

  async sendActiveEmail(email: string, fullName: string, password: string){
    const payload = {
      email: email,
      fullName: fullName,
      password: password
    };

    const token = this.jwtService.sign(payload);
    const linkActiveByEmail = `${process.env.FRONT_END_URL}/user/activate?token=${token}`;

    let tranport =createTransport({
      service:'gmail',
      auth: {
        user:process.env.USER,
        pass:process.env.PASS
      }
    })

    try {
      return tranport.sendMail({
        to: email,
        from: process.env.USER,
        subject: 'Email kích hoạt tài khoản',
        text: `Xin chào`,
        html: `<a href= ${linkActiveByEmail}>link kích hoạt tài khoản</a>`,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async fogotpassword(body: any)
  {
    const email = body.email;
    const payload = {
      email: email,
    };
    const token = this.jwtService.sign(payload);
    const linkActiveByEmail = `${process.env.FRONT_END_URL}/auth/reset-password?token=${token}`;
    
    let tranport =createTransport({
      service:'gmail',
      auth: {
        user:process.env.USER,
        pass:process.env.PASS
      }
    })

    try {
      return tranport.sendMail({
        to: email,
        from: process.env.USER,
        subject: 'Email reset mật khẩu',
        text: `Xin chào`,
        html: `<a href= ${linkActiveByEmail}>link reset mật khẩu</a>`,
      });
    } catch (error) {
      throw new BadRequestException(error);
    }
  }

  async newpassword(token:any,password: string)
  {
    const payload = this.jwtService.verify(token);
    const email = payload.email;
    const user = await this.usersRepo.findOne({ where: { email } });
    
    if(!user)
    {
      throw new BadRequestException("Didn't find user ");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;

    return this.usersRepo.save(user);
  }
}
