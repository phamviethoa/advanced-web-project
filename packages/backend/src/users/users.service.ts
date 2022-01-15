import { Injectable, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/user.entity';
const bcrypt = require('bcrypt');
import { Notification } from 'src/entities/notification.entity';
import { Classroom } from 'src/entities/classroom.entity';
import { Student } from 'src/entities/student.entity';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Notification)
    private notificationsRepo: Repository<Notification>,
    @InjectRepository(Student) private studentsRepo: Repository<Student>,
    @InjectRepository(Classroom) private classesRepo: Repository<Classroom>,
    private jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

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

  async loginByFacebook(email: string, id: string, name: string) {
    const user = await this.usersRepo.findOne({ where: { socialId: id } });

    if (!user) {
      const newUser = this.usersRepo.create({
        socialId: id.toString(),
        fullName: name,
        email: email,
        password: `no need password`,
      });

      const result = this.usersRepo.save(newUser);
      return result;
    }

    return user;
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

    return await this.usersRepo.save(newUser);
  }

  async update(id: string, body: any) {
    const task = await this.usersRepo.findOne(id);
    this.usersRepo.merge(task, body);
    return await this.usersRepo.save(task);
  }

  async sendActiveEmail(email: string, fullName: string, password: string) {
    const payload = {
      email: email,
      fullName: fullName,
      password: password,
    };

    const token = this.jwtService.sign(payload);
    const linkActiveByEmail = `${process.env.FRONT_END_URL}/user/activate?token=${token}`;

    return this.mailerService.sendMail({
      to: email,
      from: process.env.USER,
      subject: 'Email kích hoạt tài khoản',
      text: `Xin chào`,
      html: `<a href= ${linkActiveByEmail}>link kích hoạt tài khoản</a>`,
    });
  }

  async fogotpassword(body: any) {
    const email = body.email;
    const payload = {
      email: email,
    };
    const token = this.jwtService.sign(payload);
    const linkActiveByEmail = `${process.env.FRONT_END_URL}/auth/reset-password?token=${token}`;

    return this.mailerService.sendMail({
      to: email,
      from: process.env.USER,
      subject: 'Email reset mật khẩu',
      text: `Xin chào`,
      html: `<a href= ${linkActiveByEmail}>link reset mật khẩu</a>`,
    });
  }

  async newpassword(token: any, password: string) {
    const payload = this.jwtService.verify(token);
    const email = payload.email;
    const user = await this.usersRepo.findOne({ where: { email } });

    if (!user) {
      throw new BadRequestException("Didn't find user ");
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    user.password = hashedPassword;

    return this.usersRepo.save(user);
  }

  async CreateAccountAdmin(email: string, fullName: string, password: string) {
    const isValid = await this.checkUsernameIsExist(email);

    if (!isValid) {
      throw new BadRequestException(`Email Admin is existed!`);
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = this.usersRepo.create({
      email,
      fullName,
      password: hashedPassword,
      isAdmin: true,
    });

    return await this.usersRepo.save(newAdmin);
  }

  async ViewAdminList() {
    return await this.usersRepo.find({
      where: { isAdmin: true },
      order: { createdAt: 'ASC' },
    });
  }

  async ViewDetailAdmin(adminId: string) {
    const admin = this.usersRepo.findOne(adminId);

    if (!admin || (await admin).isAdmin === false) {
      throw new BadRequestException();
    }
    return admin;
  }

  async ViewClassListByAdmin() {
    return await this.classesRepo.find({
      order: { createdAt: 'ASC' },
    });
  }

  async ViewDetailClassByAdmin(classroomId: string) {
    return this.classesRepo.findOneOrFail(classroomId, {
      relations: ['teachers', 'students', 'students.grades', 'assignments'],
    });
  }

  async viewUserList() {
    return await this.usersRepo.find({
      where: { isAdmin: false },
      order: { createdAt: 'ASC' },
    });
  }

  async viewDetailUserByAdmin(userId: string) {
    return this.usersRepo.findOneOrFail(userId);
  }

  async banUnnamAccountByAdmin(AccountId: string) {
    const toBanAccount = await this.usersRepo.findOneOrFail(AccountId);
    toBanAccount.isBanned = !toBanAccount.isBanned;
    return await this.usersRepo.save(toBanAccount);
  }

  async MapStudentToUserByAdmin(studentId: string, userId: string) {
    const user = await this.usersRepo.findOne(userId);
    const student = await this.studentsRepo.findOne(studentId);

    if (!user || !student) {
      throw new BadRequestException();
    }
    student.user = user;

    return await this.studentsRepo.save(student);
  }

  async unMapStudentToUserByAdmin(studentId: string, userId: string) {
    const user = await this.usersRepo.findOne(userId);
    const student = await this.studentsRepo.findOne(studentId);

    if (!user || !student) {
      throw new BadRequestException();
    }
    student.user = undefined;
    student.identity = undefined;

    return await this.studentsRepo.save(student);
  }
}
