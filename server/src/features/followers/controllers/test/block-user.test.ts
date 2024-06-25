import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { followersMockRequest, followersMockResponse } from '@root/mocks/followers.mock';
import { AddBlockUser } from '@follower/controllers/block-user';
import { FollowerCache } from '@service/redis/follower.cache';
import { blockedQueue } from '@service/queues/blocked.queue';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/follower.cache');

describe('AddUser', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  describe('block', () => {
    it('should send correct json response', async () => {
      const req: Request = followersMockRequest({}, authUserPayload, { followerId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
      const res: Response = followersMockResponse();
      jest.spyOn(FollowerCache.prototype, 'updateBlockedUserPropInCache');
      jest.spyOn(blockedQueue, 'addBlockedUserJob');

      await AddBlockUser.prototype.blockUser(req, res);
      expect(FollowerCache.prototype.updateBlockedUserPropInCache).toHaveBeenCalledWith(
        `${req.currentUser?.userId}`,
        'blocked',
        '6064861bc25eaa5a5d2f9bf4',
        'block'
      );
      expect(FollowerCache.prototype.updateBlockedUserPropInCache).toHaveBeenCalledWith(
        '6064861bc25eaa5a5d2f9bf4',
        'blockedBy',
        `${req.currentUser?.userId}`,
        'block'
      );
      expect(blockedQueue.addBlockedUserJob).toHaveBeenCalledWith('updateBlockedUserToDB', {
        keyOne: `${req.currentUser?.userId}`,
        keyTwo: '6064861bc25eaa5a5d2f9bf4',
        type: 'block'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User Blocked Successfully'
      });
    });
  });

  describe('unblock', () => {
    it('should send correct json response', async () => {
      const req: Request = followersMockRequest({}, authUserPayload, { followerId: '6064861bc25eaa5a5d2f9bf4' }) as Request;
      const res: Response = followersMockResponse();
      jest.spyOn(FollowerCache.prototype, 'updateBlockedUserPropInCache');
      jest.spyOn(blockedQueue, 'addBlockedUserJob');

      await AddBlockUser.prototype.unBlockUser(req, res);
      expect(FollowerCache.prototype.updateBlockedUserPropInCache).toHaveBeenCalledWith(
        `${req.currentUser?.userId}`,
        'blocked',
        '6064861bc25eaa5a5d2f9bf4',
        'unblock'
      );
      expect(FollowerCache.prototype.updateBlockedUserPropInCache).toHaveBeenCalledWith(
        '6064861bc25eaa5a5d2f9bf4',
        'blockedBy',
        `${req.currentUser?.userId}`,
        'unblock'
      );
      expect(blockedQueue.addBlockedUserJob).toHaveBeenCalledWith('updateBlockedUserToDB', {
        keyOne: `${req.currentUser?.userId}`,
        keyTwo: '6064861bc25eaa5a5d2f9bf4',
        type: 'unblock'
      });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'User Unblocked Successfully'
      });
    });
  });
});
