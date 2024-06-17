import { ICommentDocument, ICommentJob } from '@comment/interfaces/comment.interface';
import { addCommentSchema } from '@comment/schemes/comment.scheme';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { commentQueue } from '@service/queues/comment.queue';
import { commentCache } from '@service/redis/comment.cache';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ObjectId } from 'mongodb';

export class AddComment {
  @joiValidation(addCommentSchema)
  public async comment(req: Request, res: Response): Promise<void> {
    const { userTo, postId, profilePicture, comment } = req.body;
    const commentObjectId: ObjectId = new ObjectId();
    const commentData: ICommentDocument = {
      _id: commentObjectId,
      username: `${req.currentUser?.username}`,
      avatarColor: `${req.currentUser?.avatarColor}`,
      postId,
      profilePicture,
      comment,
      createdAt: new Date(),
      userTo
    } as ICommentDocument;

    await commentCache.savePostCommentToCache(postId, JSON.stringify(commentData));

    const databaseCommentData: ICommentJob = {
      postId,
      userTo,
      userFrom: req.currentUser!.userId,
      username: req.currentUser!.username,
      comment: commentData
    };

    commentQueue.addCommentJob('addCommentToDB', databaseCommentData);

    res.status(StatusCodes.OK).json({ message: 'Comment added successfully' });
  }
}
