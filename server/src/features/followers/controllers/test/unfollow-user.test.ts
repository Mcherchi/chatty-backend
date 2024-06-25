import { Request, Response } from 'express';
import { authUserPayload } from '@root/mocks/auth.mock';
import { followersMockRequest, followersMockResponse } from '@root/mocks/followers.mock';

import { followerQueue } from '@service/queues/follower.queue';
import { FollowerCache } from '@service/redis/follower.cache';
import { RemoveFollower } from '@follower/controllers/unfollow-user';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/follower.cache');

describe('RemoveFollower', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should send correct json response', async () => {
    const req: Request = followersMockRequest({}, authUserPayload, {
      followerId: '6064861bc25eaa5a5d2f9bf4'
    }) as Request;
    const res: Response = followersMockResponse();
    jest.spyOn(FollowerCache.prototype, 'removeFollowerFromCache');
    jest.spyOn(FollowerCache.prototype, 'updateFollowersCountInCache');
    jest.spyOn(followerQueue, 'addFollowerJob');

    await RemoveFollower.prototype.follower(req, res);
    expect(FollowerCache.prototype.removeFollowerFromCache).toHaveBeenCalledTimes(2);
    expect(FollowerCache.prototype.removeFollowerFromCache).toHaveBeenCalledWith(
      `following:${req.currentUser!.userId}`,
      req.params.followerId
    );
    expect(FollowerCache.prototype.removeFollowerFromCache).toHaveBeenCalledWith(
      `followers:${req.params.followerId}`,
      req.currentUser!.userId
    );
    expect(FollowerCache.prototype.updateFollowersCountInCache).toHaveBeenCalledTimes(2);
    expect(FollowerCache.prototype.updateFollowersCountInCache).toHaveBeenCalledWith(`${req.params.followerId}`, 'followersCount', -1);
    expect(FollowerCache.prototype.updateFollowersCountInCache).toHaveBeenCalledWith(`${req.currentUser?.userId}`, 'followingCount', -1);
    expect(followerQueue.addFollowerJob).toHaveBeenCalledWith('removeFollowerFromDB', {
      keyOne: `${req.currentUser!.userId}`,
      keyTwo: `${req.params.followerId}`
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Unfollowed user now'
    });
  });
});
