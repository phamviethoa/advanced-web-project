import { Controller, UseGuards, Request, Get, Param } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  getAll(@Request() req: any) {
    const userId = req.user.id;
    return this.notificationsService.getAll(userId);
  }

  @Get('/:id/checked')
  markChecked(@Param('id') id: string) {
    return this.notificationsService.markNotificationIsChecked(id);
  }
}
