import { IFollowerData } from '@follower/interfaces/follower.interface';
import { followerService } from '@service/db/follower.service';
import { followerCache } from '@service/redis/follower.cache';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ObjectId } from 'mongodb';
import mongoose from 'mongoose';

export class GetFollowers {
  public async userFollowing(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.currentUser?.userId);
    const cachedFollowing: IFollowerData[] = await followerCache.getFollowersFromCache(`following:${req.currentUser?.userId}`);

    const following: IFollowerData[] = cachedFollowing.length ? cachedFollowing : await followerService.getFollowingData(userObjectId);

    res.status(StatusCodes.OK).json({ message: 'User following', following });
  }

  public async userFollowers(req: Request, res: Response): Promise<void> {
    const userObjectId: ObjectId = new mongoose.Types.ObjectId(req.params?.userId);
    const cachedFollowers: IFollowerData[] = await followerCache.getFollowersFromCache(`followers:${req.params?.userId}`);

    const followers: IFollowerData[] = cachedFollowers.length ? cachedFollowers : await followerService.getFollowerData(userObjectId);

    res.status(StatusCodes.OK).json({ message: 'User followers', followers });
  }
}
