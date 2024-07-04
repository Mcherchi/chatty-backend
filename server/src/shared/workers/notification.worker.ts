import { config } from '@root/config';
import { notificationService } from '@service/db/notification.service';
import { DoneCallback, Job } from 'bull';
import { Logger } from 'winston';

const log: Logger = config.createLogger('notificationWorker');

class NotificationWorker {
  async updateNotificationToDB(job: Job, done: DoneCallback) {
    try {
      const { key } = job.data;
      await notificationService.updateNotification(key);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error('NotificationWorker.updateNotification() method error: ', error);
      done(error as Error);
    }
  }

  async deleteNotificationFromDB(job: Job, done: DoneCallback) {
    try {
      const { key } = job.data;
      await notificationService.deleteNotification(key);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error('NotificationWorker.updateNotification() method error: ', error);
      done(error as Error);
    }
  }
}

export const notificationWorker: NotificationWorker = new NotificationWorker();
