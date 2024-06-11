import { IGetPostsQuery, IPostDocument } from '@post/interfaces/post.interface';
import { PostModel } from '@post/models/post.schema';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UserModel } from '@user/models/user.schema';
import { UpdateQuery } from 'mongoose';

class PostService {
  public async addPostToDB(userId: string, createdPost: IPostDocument): Promise<void> {
    const post: Promise<IPostDocument> = PostModel.create(createdPost);
    const user: UpdateQuery<IUserDocument> = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: 1 } });
    await Promise.all([post, user]);
  }

  public async getPosts(query: IGetPostsQuery, skip = 0, limit = 0, sort: Record<string, 1 | -1>): Promise<IPostDocument[]> {
    let postQuery = {};
    if (query.imgId && query.gifUrl) {
      postQuery = {
        $or: [{ imgId: { $ne: '' } }, { gifUrl: { $ne: '' } }]
      };
    } else {
      postQuery = query;
    }

    const posts: IPostDocument[] = await PostModel.aggregate([{ $match: postQuery }, { $sort: sort }, { $skip: skip }, { $limit: limit }]);

    return posts;
  }

  public async getPostsCount(): Promise<number> {
    const count: number = await PostModel.find({}).countDocuments();
    return count;
  }

  public async deletePost(postId: string, userId: string): Promise<void> {
    const deletePost = PostModel.deleteOne({ _id: postId });
    const decrementPostCount = UserModel.updateOne({ _id: userId }, { $inc: { postsCount: -1 } });

    await Promise.all([deletePost, decrementPostCount]);
  }

  public async updatePost(postId: string, updatedPost: IPostDocument): Promise<void> {
    await PostModel.updateOne({ _id: postId }, { $set: updatedPost });
  }
}

export const postService: PostService = new PostService();
