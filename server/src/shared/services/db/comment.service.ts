/* eslint-disable @typescript-eslint/no-unused-vars */
import { ICommentDocument, ICommentJob, ICommentNameList, IQueryComment } from '@comment/interfaces/comment.interface';
import { CommentsModel } from '@comment/models/comment.schema';
import { IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { userCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';

class CommentService {
  public async addCommentToDB(commentData: ICommentJob): Promise<void> {
    const { postId, userTo, userFrom, username, comment } = commentData;
    const comments: Promise<ICommentDocument> = CommentsModel.create(comment);
    const post = PostModel.findOneAndUpdate({ _id: postId }, { $inc: { commentsCount: 1 } }, { new: true });
    const user: Promise<IUserDocument> = userCache.getUserFromCache(userTo) as Promise<IUserDocument>;
    const response: [ICommentDocument, IPostDocument, IUserDocument] = (await Promise.all([comments, post, user])) as [
      ICommentDocument,
      IPostDocument,
      IUserDocument
    ];

    //send comments notifications
  }

  public async getPostComments(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentDocument[]> {
    const comments: ICommentDocument[] = await CommentsModel.aggregate([{ $match: query }, { $sort: sort }]);

    return comments;
  }

  public async getPostCommentsNames(query: IQueryComment, sort: Record<string, 1 | -1>): Promise<ICommentNameList[]> {
    const comments: ICommentNameList[] = await CommentsModel.aggregate([
      { $match: query },
      { $sort: sort },
      { $group: { _id: null, names: { $addToSet: '$username' }, count: { $sum: 1 } } },
      { $project: { _id: 0 } }
    ]);

    return comments;
  }
}

export const commentService: CommentService = new CommentService();
