import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { IReaction, IReactionDocument } from '@reaction/interfaces/reactions.interface';
import { BaseCache } from '@service/redis/base.cache';

export class ReactionCache extends BaseCache {
  constructor() {
    super('reactionCache');
  }

  public async savePostReactionToCache(
    key: string,
    reaction: IReactionDocument,
    postReactions: IReaction,
    type: string,
    previousReaction: string
  ): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      if (previousReaction) {
        this.removePostReactionFromCache(key, reaction.username, postReactions);
      }

      if (type) {
        await this.client.LPUSH(`reactions:${key}`, JSON.stringify(reaction));
        await this.client.HSET(`posts:${key}`, 'reactions', JSON.stringify(postReactions));
      }
    } catch (error) {
      this.log.error('ReactionCache.savePostReactionToCache() method error: ', error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async removePostReactionFromCache(key: string, username: string, postReactions: IReaction): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const reactions: string[] = await this.client.LRANGE(`reactions:${key}`, 0, -1);
      const multi: ReturnType<typeof this.client.multi> = this.client.multi();
      const userPreviousReaction: IReactionDocument = this.getPreviousReaction(reactions, username) as IReactionDocument;
      multi.LREM(`reactions:${key}`, 1, JSON.stringify(userPreviousReaction));
      await multi.exec();
      await this.client.HSET(`posts:${key}`, 'reactions', JSON.stringify(postReactions));
    } catch (error) {
      this.log.error('ReactionCache.savePostReactionToCache() method error: ', error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getReactionsFromCache(key: string): Promise<[IReactionDocument[], number]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const reactionsCount: number = await this.client.LLEN(`reactions:${key}`);
      const response: string[] = await this.client.LRANGE(`reactions:${key}`, 0, -1);
      const list: IReactionDocument[] = response.map((item) => Helpers.parseJson(item));

      return response.length ? [list, reactionsCount] : [[], 0];
    } catch (error) {
      this.log.error('ReactionCache.getReactionsFromCache() method error: ', error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getUserReactionFromCache(key: string, username: string): Promise<[IReactionDocument, number] | []> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const response: string[] = await this.client.LRANGE(`reactions:${key}`, 0, -1);
      const list: IReactionDocument[] = response.map((item) => Helpers.parseJson(item));

      const result: IReactionDocument = list.find(
        (item: IReactionDocument) => item.postId === key && item.username === username
      ) as IReactionDocument;

      return result ? [result, 1] : [];
    } catch (error) {
      this.log.error('ReactionCache.getReactionsFromCache() method error: ', error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public getPreviousReaction(reactions: string[], username: string): IReactionDocument | undefined {
    const list: IReactionDocument[] = [];

    for (const item of reactions) {
      list.push(Helpers.parseJson(item));
    }

    return list.find((item: IReactionDocument) => item.username === username);
  }
}

export const reactionCache: ReactionCache = new ReactionCache();
