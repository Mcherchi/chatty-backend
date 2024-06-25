import { followerQueue } from '@service/queues/follower.queue';
import { followerCache } from '@service/redis/follower.cache';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class RemoveFollower {
  public async follower(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;
    const removeFollowerFromCache: Promise<void> = followerCache.removeFollowerFromCache(
      `followers:${followerId}`,
      `${req.currentUser?.userId}`
    );
    const removeFolloweeFromCache: Promise<void> = followerCache.removeFollowerFromCache(
      `following:${req.currentUser?.userId}`,
      followerId
    );

    const followersCount: Promise<void> = followerCache.updateFollowersCountInCache(`${followerId}`, 'followersCount', -1);
    const followeeCount: Promise<void> = followerCache.updateFollowersCountInCache(`${req.currentUser?.userId}`, 'followingCount', -1);

    await Promise.all([removeFollowerFromCache, removeFolloweeFromCache, followersCount, followeeCount]);

    followerQueue.addFollowerJob('removeFollowerFromDB', { keyOne: `${req.currentUser?.userId}`, keyTwo: `${followerId}` });

    res.status(StatusCodes.OK).json({ message: 'Unfollowed user now' });
  }
}
