import { postQueue } from '@service/queues/post.queue';
import { postCache } from '@service/redis/post.cache';
import { socketIOPostObject } from '@socket/post.socket';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class DeletePost {
  public async delete(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const userId = req.currentUser?.userId;

    socketIOPostObject.emit('post deleted', postId);

    await postCache.deletePostFromCache(postId, `${userId}`);
    postQueue.addPostJob('deletePostFromDB', { keyOne: postId, keyTwo: userId });

    res.status(StatusCodes.OK).json({ message: 'Post deleted successfully' });
  }
}
