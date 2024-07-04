import { INotificationJobData } from '@notification/interfaces/notification.interface';
import { BaseQueue } from './base.queue';
import { notificationWorker } from '@worker/notification.worker';

class NotificationQueue extends BaseQueue {
  constructor() {
    super('notification');
    this.processJob('updateNotificationToDB', 5, notificationWorker.updateNotificationToDB);
    this.processJob('deleteNotificationFromDB', 5, notificationWorker.deleteNotificationFromDB);
  }

  public addNotificationJob(name: string, data: INotificationJobData) {
    this.addJob(name, data);
  }
}

export const notificationQueue: NotificationQueue = new NotificationQueue();
