import { authUserPayload } from '@root/mocks/auth.mock';
import { notificationMockRequest, notificationMockResponse } from '@root/mocks/notification.mock';
import { notificationQueue } from '@service/queues/notification.queue';
import * as notificationServer from '@socket/notification.socket';
import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { UpdateNotification } from '../update-notification';
jest.useFakeTimers();
jest.mock('@service/queues/base.queue');

Object.defineProperties(notificationServer, {
  socketIONotificationObject: {
    value: new Server(),
    writable: true
  }
});

describe('UpdateNotifications', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should send correct json response', async () => {
    const req: Request = notificationMockRequest({}, authUserPayload, { notificationId: '12345' }) as Request;
    const res: Response = notificationMockResponse();
    jest.spyOn(notificationServer.socketIONotificationObject, 'emit');
    jest.spyOn(notificationQueue, 'addNotificationJob');

    await UpdateNotification.prototype.update(req, res);

    expect(notificationServer.socketIONotificationObject.emit).toHaveBeenCalledWith('update notification', req.params.notificationId);
    expect(notificationQueue.addNotificationJob).toHaveBeenCalledWith('updateNotificationToDB', { key: req.params.notificationId });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Notification marked as read'
    });
  });
});
