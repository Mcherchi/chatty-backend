import { notificationQueue } from '@service/queues/notification.queue';
import { socketIONotificationObject } from '@socket/notification.socket';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class DeleteNotification {
  public async delete(req: Request, res: Response): Promise<void> {
    const { notificationId } = req.params;
    //for remove item from client list
    socketIONotificationObject.emit('delete notification', notificationId);

    notificationQueue.addNotificationJob('deleteNotificationFromDB', { key: notificationId });

    res.status(StatusCodes.OK).json({ message: 'Notification deleted successfully' });
  }
}
