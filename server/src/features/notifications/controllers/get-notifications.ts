import { INotificationDocument } from '@notification/interfaces/notification.interface';
import { notificationService } from '@service/db/notification.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class GetNotification {
  public async get(req: Request, res: Response): Promise<void> {
    const notifications: INotificationDocument[] = await notificationService.getNotifications(req.currentUser!.userId);

    res.status(StatusCodes.OK).json({ message: 'User Notifications', notifications });
  }
}
