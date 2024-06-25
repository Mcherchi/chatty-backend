import { IFollowerData } from '@follower/interfaces/follower.interface';
import { followerCache } from '@service/redis/follower.cache';
import { userCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { ObjectId } from 'mongodb';
import { StatusCodes } from 'http-status-codes';
import { socketIOFollowerObject } from '@socket/follower.socket';
import { followerQueue } from '@service/queues/follower.queue';

export class AddFollower {
  public async follower(req: Request, res: Response): Promise<void> {
    const { followerId } = req.params;
    //update count in cache
    const followersCount: Promise<void> = followerCache.updateFollowersCountInCache(`${followerId}`, 'followersCount', 1);
    const followeeCount: Promise<void> = followerCache.updateFollowersCountInCache(`${req.currentUser?.userId}`, 'followingCount', 1);

    await Promise.all([followersCount, followeeCount]);

    const cachedFollower: Promise<IUserDocument> = userCache.getUserFromCache(`${followerId}`) as Promise<IUserDocument>;
    const cachedFollowee: Promise<IUserDocument> = userCache.getUserFromCache(`${req.currentUser?.userId}`) as Promise<IUserDocument>;

    const response: [IUserDocument, IUserDocument] = await Promise.all([cachedFollower, cachedFollowee]);

    const followerObjectId: ObjectId = new ObjectId();
    const addFollowerData: IFollowerData = AddFollower.prototype.userData(response[0]);
    socketIOFollowerObject.emit('add follower', addFollowerData);

    const addFollowerToCache: Promise<void> = followerCache.saveFollowerToCache(`followers:${followerId}`, `${req.currentUser?.userId}`);
    const addFolloweeToCache: Promise<void> = followerCache.saveFollowerToCache(`following:${req.currentUser?.userId}`, `${followerId}`);

    await Promise.all([addFollowerToCache, addFolloweeToCache]);

    followerQueue.addFollowerJob('addFollowerToDB', {
      keyOne: `${req.currentUser?.userId}`,
      keyTwo: `${followerId}`,
      username: req.currentUser?.username,
      followerDocumentId: followerObjectId
    });

    res.status(StatusCodes.OK).json({ message: 'Following user now' });
  }

  private userData(user: IUserDocument): IFollowerData {
    return {
      _id: new mongoose.Types.ObjectId(user._id),
      username: user.username!,
      avatarColor: user.avatarColor!,
      postCount: user.postsCount,
      followersCount: user.followersCount,
      followingCount: user.followingCount,
      profilePicture: user.profilePicture,
      uId: user.uId!,
      userProfile: user
    };
  }
}
