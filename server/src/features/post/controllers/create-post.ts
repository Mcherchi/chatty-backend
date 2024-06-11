import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { upload } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postSchema, postWithImageSchema } from '@post/schemes/post.schemes';
import { postQueue } from '@service/queues/post.queue';
import { PostCache } from '@service/redis/post.cache';
import { socketIOPostObject } from '@socket/post.socket';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { ObjectId } from 'mongodb';

const postCache: PostCache = new PostCache();

export class CreatePost {
  @joiValidation(postSchema)
  public async create(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings } = req.body;

    const postObjectId: ObjectId = new ObjectId();
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      privacy,
      gifUrl,
      feelings,
      commentsCount: 0,
      imgId: '',
      imgVersion: '',
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, wow: 0, sad: 0, angry: 0 }
    } as IPostDocument;

    socketIOPostObject.emit('add post', createdPost);

    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: `${req.currentUser?.userId}`,
      uId: `${req.currentUser?.uId}`,
      createdPost
    });

    postQueue.addPostJob('addPostToDB', { userId: req.currentUser?.userId, value: createdPost });

    res.status(StatusCodes.CREATED).json({ message: 'Post created successfully' });
  }

  @joiValidation(postWithImageSchema)
  public async createWithImage(req: Request, res: Response): Promise<void> {
    const { post, bgColor, privacy, gifUrl, profilePicture, feelings, image } = req.body;

    const uploadResult: UploadApiResponse = (await upload(image)) as UploadApiResponse;
    if (!uploadResult?.public_id) {
      throw new BadRequestError(uploadResult.message);
    }

    const postObjectId: ObjectId = new ObjectId();
    const createdPost: IPostDocument = {
      _id: postObjectId,
      userId: req.currentUser!.userId,
      username: req.currentUser!.username,
      email: req.currentUser!.email,
      avatarColor: req.currentUser!.avatarColor,
      profilePicture,
      post,
      bgColor,
      privacy,
      gifUrl,
      feelings,
      commentsCount: 0,
      imgId: uploadResult.public_id,
      imgVersion: uploadResult.version.toString(),
      createdAt: new Date(),
      reactions: { like: 0, love: 0, happy: 0, wow: 0, sad: 0, angry: 0 }
    } as IPostDocument;

    socketIOPostObject.emit('add post', createdPost);

    await postCache.savePostToCache({
      key: postObjectId,
      currentUserId: `${req.currentUser?.userId}`,
      uId: `${req.currentUser?.uId}`,
      createdPost
    });

    postQueue.addPostJob('addPostToDB', { userId: req.currentUser?.userId, value: createdPost });

    res.status(StatusCodes.CREATED).json({ message: 'Post created with image successfully' });
  }
}
