import { ServerError } from '@global/helpers/error-handler';
import { BaseCache } from './base.cache';
import { IFollowerData } from '@follower/interfaces/follower.interface';
import { userCache } from './user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import mongoose from 'mongoose';
import { Helpers } from '@global/helpers/helpers';

export class FollowerCache extends BaseCache {
  constructor() {
    super('followerCache');
  }

  public async saveFollowerToCache(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LPUSH(key, value);
    } catch (error) {
      this.log.error('FollowerCache.saveFollowerToCache() method error: ', error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async removeFollowerFromCache(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.LREM(key, 1, value);
    } catch (error) {
      this.log.error('FollowerCache.removeFollowerFromCache() method error: ', error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async updateFollowersCountInCache(key: string, prop: string, value: number): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      await this.client.HINCRBY(`users:${key}`, prop, value);
    } catch (error) {
      this.log.error('FollowerCache.removeFollowerFromCache() method error: ', error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getFollowersFromCache(key: string): Promise<IFollowerData[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(key, 0, -1);

      const followers: IFollowerData[] = await Promise.all(
        response.map(async (item) => {
          const user = (await userCache.getUserFromCache(item)) as IUserDocument;
          return {
            avatarColor: user.avatarColor!,
            followersCount: user.followersCount,
            followingCount: user.followingCount,
            profilePicture: user.profilePicture,
            postCount: user.postsCount,
            username: user.username!,
            uId: user.uId!,
            _id: new mongoose.Types.ObjectId(user._id)
          };
        })
      );

      return followers;
    } catch (error) {
      this.log.error('FollowerCache.getFollowersFromCache() method error: ', error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async updateBlockedUserPropInCache(key: string, prop: string, value: string, type: 'block' | 'unblock'): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const response: string = (await this.client.HGET(`users:${key}`, prop)) as string;
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      let blocked: string[] = Helpers.parseJson(response) as string[];
      if (type === 'block') {
        blocked = [...blocked, value];
      } else {
        blocked = blocked.filter((id: string) => id !== value);
      }

      multi.HSET(`users:${key}`, prop, JSON.stringify(blocked));
      await multi.exec();
    } catch (error) {
      this.log.error('FollowerCache.updateBlockedUserPropInCache() method error: ', error);
      throw new ServerError('Server error. Try again.');
    }
  }
}

export const followerCache: FollowerCache = new FollowerCache();
