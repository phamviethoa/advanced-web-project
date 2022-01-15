import { Injectable, NotFoundException } from '@nestjs/common';
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

  async addNotification(
    from: string,
    userId: string,
    message: string,
    link: string,
  ) {
    const user = await this.usersRepo.findOne(userId);

    if (!user) {
      return;
    }

    const notification = this.notificationsRepo.create({
      from,
      link,
      message,
      isChecked: false,
      user,
    });

    return this.notificationsRepo.save(notification);
  }

  async markNotificationIsChecked(id: string) {
    const notification = await this.notificationsRepo.findOne(id);

    if (!notification) {
      throw new NotFoundException();
    }

    return this.notificationsRepo.save({ ...notification, isChecked: true });
  }

  async getAll(userId: string) {
    const notifications = await this.notificationsRepo
      .createQueryBuilder('notification')
      .innerJoin('notification.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('notification.isChecked = :isChecked', { isChecked: false })
      .addSelect('notification.createdAt')
      .getMany();

    return notifications;
  }
}
