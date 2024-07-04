import { authUserPayload } from '@root/mocks/auth.mock';
import { notificationData, notificationMockRequest, notificationMockResponse } from '@root/mocks/notification.mock';
import { Request, Response } from 'express';
import { GetNotification } from '@notification/controllers/get-notifications';
import { notificationService } from '@service/db/notification.service';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/db/notification.service');

describe('GetNotification', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should send correct json response', async () => {
    const req: Request = notificationMockRequest({}, authUserPayload, {}) as Request;
    const res: Response = notificationMockResponse();

    jest.spyOn(notificationService, 'getNotifications').mockResolvedValue([notificationData]);

    await GetNotification.prototype.get(req, res);
    expect(notificationService.getNotifications).toHaveBeenCalledWith(req.currentUser?.userId);
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User Notifications',
      notifications: [notificationData]
    });
  });
});
