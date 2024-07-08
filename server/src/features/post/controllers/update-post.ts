import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { upload } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
import { IPostDocument } from '@post/interfaces/post.interface';
import { postSchema, postWithImageSchema } from '@post/schemes/post.schemes';
import { imageQueue } from '@service/queues/image.queue';
import { postQueue } from '@service/queues/post.queue';
import { postCache } from '@service/redis/post.cache';
import { socketIOPostObject } from '@socket/post.socket';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class UpdatePost {
  @joiValidation(postSchema)
  public async update(req: Request, res: Response): Promise<void> {
    await UpdatePost.prototype.updatePost(req);
    res.status(StatusCodes.OK).json({ message: 'Post updated successfully' });
  }

  public async updateWithImage(req: Request, res: Response): Promise<void> {
    const { imgId, imgVersion } = req.body;
    if (imgId && imgVersion) {
      await UpdatePost.prototype.updatePost(req);
    } else {
      const result: UploadApiResponse = await UpdatePost.prototype.addImageToExistingPost(req);
      if (!result.public_id) {
        throw new BadRequestError(result.message);
      }
    }

    res.status(StatusCodes.OK).json({ message: 'Post with image updated successfully' });
  }

  private async updatePost(req: Request): Promise<void> {
    const { post, bgColor, feelings, privacy, gifUrl, imgVersion, imgId, profilePicture } = req.body;
    const { postId } = req.params;
    const dataToSave: IPostDocument = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgVersion,
      imgId,
      profilePicture
    } as IPostDocument;
    const updatedPost = await postCache.updatePostInCache(postId, dataToSave);

    socketIOPostObject.emit('updated post', updatedPost);
    postQueue.addPostJob('updatePostInDB', { keyOne: postId, value: updatedPost });
  }

  @joiValidation(postWithImageSchema)
  private async addImageToExistingPost(req: Request): Promise<UploadApiResponse> {
    const { post, bgColor, feelings, privacy, gifUrl, profilePicture, image } = req.body;
    const { postId } = req.params;
    const uploadResult: UploadApiResponse = (await upload(image)) as UploadApiResponse;
    if (!uploadResult?.public_id) {
      return uploadResult;
    }
    const dataToSave: IPostDocument = {
      post,
      bgColor,
      feelings,
      privacy,
      gifUrl,
      imgId: image ? uploadResult.public_id : '',
      imgVersion: image ? uploadResult.version.toString() : '',
      profilePicture
    } as IPostDocument;
    const updatedPost = await postCache.updatePostInCache(postId, dataToSave);

    socketIOPostObject.emit('updated post', updatedPost);
    postQueue.addPostJob('updatePostInDB', { keyOne: postId, value: updatedPost });
    if (image) {
      imageQueue.addImageJob('addImageToDb', {
        key: req.currentUser?.userId,
        imgId: uploadResult.public_id,
        imgVersion: uploadResult.version.toString()
      });
    }

    return uploadResult;
  }
}
