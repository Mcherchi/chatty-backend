import { blockedQueue } from '@service/queues/blocked.queue';
import { followerCache } from '@service/redis/follower.cache';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class AddBlockUser {
  public async blockUser(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;

    AddBlockUser.prototype.updateBlockedUserInCache(req.currentUser!.userId, followerId, 'block');

    blockedQueue.addBlockedUserJob('updateBlockedUserToDB', { keyOne: req.currentUser?.userId, keyTwo: followerId, type: 'block' });

    res.status(StatusCodes.OK).json({ message: 'User Blocked Successfully' });
  }

  public async unBlockUser(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;

    AddBlockUser.prototype.updateBlockedUserInCache(req.currentUser!.userId, followerId, 'unblock');

    blockedQueue.addBlockedUserJob('updateBlockedUserToDB', { keyOne: req.currentUser?.userId, keyTwo: followerId, type: 'unblock' });

    res.status(StatusCodes.OK).json({ message: 'User Unblocked Successfully' });
  }

  private async updateBlockedUserInCache(userId: string, followerId: string, type: 'block' | 'unblock'): Promise<void> {
    const blocked: Promise<void> = followerCache.updateBlockedUserPropInCache(`${userId}`, 'blocked', `${followerId}`, type);
    const blockedBy: Promise<void> = followerCache.updateBlockedUserPropInCache(`${followerId}`, 'blockedBy', `${userId}`, type);

    await Promise.all([blocked, blockedBy]);
  }
}
