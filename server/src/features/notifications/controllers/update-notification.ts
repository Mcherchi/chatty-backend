import { notificationQueue } from '@service/queues/notification.queue';
import { socketIONotificationObject } from '@socket/notification.socket';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class UpdateNotification {
  public async update(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.params;
    //for remove item from client list
    socketIONotificationObject.emit('update notification', notificationId);

    notificationQueue.addNotificationJob('updateNotificationToDB', { key: notificationId });

    res.status(StatusCodes.OK).json({ message: 'Notification marked as read' });
  }
}
