import mongoose, { Model, Schema, model } from 'mongoose';
import { INotification, INotificationDocument } from '../interfaces/notification.interface';
import { notificationService } from '@service/db/notification.service';

const notificationSchema: Schema = new Schema({
  userTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  userFrom: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, default: '' },
  read: { type: Boolean, default: false },
  notificationType: { type: String },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  createdItemId: { type: mongoose.Schema.Types.ObjectId },
  comment: { type: String, default: '' },
  reaction: { type: String, default: '' },
  post: { type: String, default: '' },
  imgId: { type: String, default: '' },
  imgVersion: { type: String, default: '' },
  gifUrl: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now() }
});

notificationSchema.methods.insertNotification = async function (body: INotification) {
  const {
    userTo,
    userFrom,
    message,
    notificationType,
    entityId,
    createdItemId,
    comment,
    reaction,
    post,
    imgId,
    imgVersion,
    gifUrl,
    createdAt
  } = body;

  await NotificationModel.create({
    userTo,
    userFrom,
    message,
    notificationType,
    entityId,
    createdItemId,
    comment,
    reaction,
    post,
    imgId,
    imgVersion,
    gifUrl,
    createdAt
  });

  try {
    const notifications: INotificationDocument[] = await notificationService.getNotifications(userTo);
    return notifications;
  } catch (error) {
    return error;
  }
};

const NotificationModel: Model<INotificationDocument> = model<INotificationDocument>('Notification', notificationSchema, 'Notification');

export { NotificationModel };
