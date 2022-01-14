import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from 'src/entities/notification.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepo: Repository<Notification>,
    @InjectRepository(User) private usersRepo: Repository<User>,
  ) {}

  async addNotification(userId: string, message: string) {
    const user = await this.usersRepo.findOne(userId);

    if (!user) {
      return;
    }

    const notification = this.notificationsRepo.create({
      message,
      isChecked: false,
      user,
    });

    return this.notificationsRepo.save(notification);
  }

  async getAll(userId: string) {
    const notifications = await this.notificationsRepo
      .createQueryBuilder('notification')
      .innerJoin('notification.user', 'user')
      .where('user.id = :userId', { userId })
      .getMany();

    return notifications;
  }
}
