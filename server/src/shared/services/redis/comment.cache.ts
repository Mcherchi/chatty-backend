import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comment.interface';
import { ServerError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { BaseCache } from '@service/redis/base.cache';

export class CommentCache extends BaseCache {
  constructor() {
    super('commentCache');
  }

  public async savePostCommentToCache(key: string, value: string): Promise<void> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      await this.client.LPUSH(`comments:${key}`, value);
      const commentsCount: string[] = await this.client.HMGET(`posts:${key}`, 'commentsCount');
      const count: number = parseInt(commentsCount[0], 10) + 1;
      await this.client.HSET(`posts:${key}`, 'commentsCount', count);
    } catch (error) {
      this.log.error('CommentCache.savePostCommentToCache() method error: ', error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getCommentsFromCache(key: string): Promise<ICommentDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const results: string[] = await this.client.LRANGE(`comments:${key}`, 0, -1);
      const comments: ICommentDocument[] = results.map((item) => Helpers.parseJson(item));

      return comments;
    } catch (error) {
      this.log.error('CommentCache.getCommentsFromCache() method error: ', error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getCommentsNamesFromCache(key: string): Promise<ICommentNameList[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }

      const commentsCount: number = await this.client.LLEN(`comments:${key}`);
      const comments: string[] = await this.client.LRANGE(`comments:${key}`, 0, -1);
      const namesSet: Set<string> = new Set();
      comments.forEach((item) => {
        const parsedItem: ICommentDocument = Helpers.parseJson(item);
        namesSet.add(parsedItem.username);
      });
      const names: string[] = Array.from(namesSet);

      const response: ICommentNameList = {
        count: commentsCount,
        names
      };

      return [response];
    } catch (error) {
      this.log.error('CommentCache.getCommentsFromCache() method error: ', error);
      throw new ServerError('Server error. Try again.');
    }
  }

  public async getSingleCommentFromCache(key: string, commentId: string): Promise<ICommentDocument[]> {
    try {
      if (!this.client.isOpen) {
        await this.client.connect();
      }
      const comments: string[] = await this.client.LRANGE(`comments:${key}`, 0, -1);
      const comment: ICommentDocument = comments
        .map((item) => {
          return Helpers.parseJson(item) as ICommentDocument;
        })
        .find((parsedItem) => parsedItem._id === commentId) as ICommentDocument;

      return [comment];
    } catch (error) {
      this.log.error('CommentCache.getCommentsFromCache() method error: ', error);
      throw new ServerError('Server error. Try again.');
    }
  }
}

export const commentCache: CommentCache = new CommentCache();
