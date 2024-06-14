import { IReactionJob } from '@reaction/interfaces/reactions.interface';
import { reactionQueue } from '@service/queues/reaction.queue';
import { reactionCache } from '@service/redis/reaction.cache';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class RemoveReaction {
  public async reaction(req: Request, res: Response): Promise<void> {
    const { postId, previousReaction, postReaction } = req.params;

    await reactionCache.removePostReactionFromCache(postId, `${req.currentUser!.username}`, JSON.parse(postReaction));

    const databaseReactionData: IReactionJob = {
      postId,
      username: req.currentUser!.username,
      previousReaction
    };

    reactionQueue.addReactionJob('removeReactionFromDB', databaseReactionData);
    res.status(StatusCodes.OK).json({ message: 'Reaction removed from post successfully' });
  }
}
