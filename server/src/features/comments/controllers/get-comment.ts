import { ICommentDocument, ICommentNameList } from '@comment/interfaces/comment.interface';
import { commentService } from '@service/db/comment.service';
import { commentCache } from '@service/redis/comment.cache';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

import mongoose from 'mongoose';

export class GetComment {
  public async comments(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedComments: ICommentDocument[] = await commentCache.getCommentsFromCache(postId);

    const comments: ICommentDocument[] = cachedComments.length
      ? cachedComments
      : await commentService.getPostComments({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(StatusCodes.OK).json({ message: 'Post Comments', comments });
  }

  public async commentsNames(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedCommentsNames: ICommentNameList[] = await commentCache.getCommentsNamesFromCache(postId);
    const commentsNames: ICommentNameList[] = cachedCommentsNames.length
      ? cachedCommentsNames
      : await commentService.getPostCommentsNames({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(StatusCodes.OK).json({ message: 'Post Comments names', comments: commentsNames.length ? commentsNames[0] : [] });
  }

  public async singleComment(req: Request, res: Response): Promise<void> {
    const { postId, commentId } = req.params;
    const cachedComment: ICommentDocument[] = await commentCache.getSingleCommentFromCache(postId, commentId);

    const comment: ICommentDocument[] = cachedComment.length
      ? cachedComment
      : await commentService.getPostComments({ _id: new mongoose.Types.ObjectId(commentId) }, { createdAt: -1 });

    res.status(StatusCodes.OK).json({ message: 'Single Comment', comments: comment.length ? comment[0] : [] });
  }
}
