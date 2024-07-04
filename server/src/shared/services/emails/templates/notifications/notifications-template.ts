import fs from 'fs';
import ejs from 'ejs';
import { INotificationTemplate } from '@notification/interfaces/notification.interface';

class NotificationTemplate {
  public notificationMessageTemplate(templateParams: INotificationTemplate): string {
    const { username, header, message } = templateParams;
    return ejs.render(fs.readFileSync(__dirname + '/notification.ejs', 'utf-8'), {
      header,
      username,
      message,
      image_url:
        'https://img.freepik.com/free-photo/new-incoming-message-email-icon_53876-14640.jpg?size=626&ext=jpg&ga=GA1.1.955017163.1719407143&semt=ais_user'
    });
  }
}

export const notificationTemplate: NotificationTemplate = new NotificationTemplate();
