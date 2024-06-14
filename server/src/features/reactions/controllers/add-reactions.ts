import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { IReactionDocument, IReactionJob } from '@reaction/interfaces/reactions.interface';
import { addReactionSchema } from '@reaction/schemes/reactions.scheme';
import { reactionQueue } from '@service/queues/reaction.queue';
import { reactionCache } from '@service/redis/reaction.cache';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ObjectId } from 'mongodb';

export class AddReaction {
  @joiValidation(addReactionSchema)
  public async reaction(req: Request, res: Response): Promise<void> {
    const { userTo, postId, type, previousReaction, postReactions, profilePicture } = req.body;
    const reactionObject: IReactionDocument = {
      _id: new ObjectId(),
      postId,
      type,
      avatarColor: req.currentUser?.avatarColor,
      username: req.currentUser?.username,
      profilePicture
    } as IReactionDocument;

    await reactionCache.savePostReactionToCache(postId, reactionObject, postReactions, type, previousReaction);

    const databaseReactionData: IReactionJob = {
      postId,
      userTo,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      type,
      previousReaction,
      reactionObject
    };

    reactionQueue.addReactionJob('addReactionToDB', databaseReactionData);

    res.status(StatusCodes.OK).json({ message: 'Reaction added successfully' });
  }
}
