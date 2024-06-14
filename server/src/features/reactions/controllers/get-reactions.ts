import { IReactionDocument } from '@reaction/interfaces/reactions.interface';
import { reactionService } from '@service/db/reaction.service';
import { reactionCache } from '@service/redis/reaction.cache';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import mongoose from 'mongoose';

export class GetReaction {
  public async reactions(req: Request, res: Response): Promise<void> {
    const { postId } = req.params;
    const cachedReactions: [IReactionDocument[], number] = await reactionCache.getReactionsFromCache(postId);

    const reactions: [IReactionDocument[], number] = cachedReactions[0].length
      ? cachedReactions
      : await reactionService.getReactionsDataFromDB({ postId: new mongoose.Types.ObjectId(postId) }, { createdAt: -1 });

    res.status(StatusCodes.OK).json({ message: 'Post reactions', reactions: reactions[0], count: reactions[1] });
  }

  public async singleReactionByUsername(req: Request, res: Response): Promise<void> {
    const { postId, username } = req.params;
    const cachedReaction: [IReactionDocument, number] | [] = await reactionCache.getUserReactionFromCache(postId, username);

    const reactions: [IReactionDocument, number] | [] = cachedReaction.length
      ? cachedReaction
      : await reactionService.getSinglePostReactionByUsername(postId, username);

    res.status(StatusCodes.OK).json({
      message: 'Single post reaction by username',
      reactions: reactions.length ? reactions[0] : {},
      count: reactions.length ? reactions[1] : 0
    });
  }

  public async reactionsByUsername(req: Request, res: Response): Promise<void> {
    const { username } = req.params;

    const reactions: IReactionDocument[] = await reactionService.getReactionsByUsername(username);
    res.status(StatusCodes.OK).json({
      message: 'user reactions',
      reactions,
      count: reactions.length
    });
  }
}
