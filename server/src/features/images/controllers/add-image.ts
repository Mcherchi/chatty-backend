import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { upload } from '@global/helpers/cloudinary-upload';
import { BadRequestError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { IBgUploadResponse } from '@image/interfaces/image.interface';
import { addImageSchema } from '@image/schemes/images.scheme';
import { imageQueue } from '@service/queues/image.queue';
import { userCache } from '@service/redis/user.cache';
import { socketIOImageObject } from '@socket/image.socket';
import { IUserDocument } from '@user/interfaces/user.interface';
import { UploadApiResponse } from 'cloudinary';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class AddImage {
  @joiValidation(addImageSchema)
  public async profileImage(req: Request, res: Response): Promise<void> {
    const { image } = req.body;

    const uploadResult: UploadApiResponse = (await upload(image, req.currentUser?.userId, true, true)) as UploadApiResponse;
    if (!uploadResult?.public_id) {
      throw new BadRequestError(uploadResult.message);
    }

    const url = uploadResult.secure_url;
    const cachedUser: IUserDocument = (await userCache.updateSingleUserItemInCache(
      `${req.currentUser?.userId}`,
      'profilePicture',
      url
    )) as IUserDocument;
    socketIOImageObject.emit('update user', cachedUser);

    imageQueue.addImageJob('addUserProfileImageToDb', {
      key: `${req.currentUser?.userId}`,
      value: url,
      imgId: uploadResult.public_id,
      imgVersion: uploadResult.version.toString()
    });

    res.status(StatusCodes.OK).json({ message: 'Image added successfully' });
  }

  @joiValidation(addImageSchema)
  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const { image } = req.body;
    const { version, publicId }: IBgUploadResponse = await AddImage.prototype.backgroundUpload(image);

    const bgImageId: Promise<IUserDocument> = userCache.updateSingleUserItemInCache(
      `${req.currentUser?.userId}`,
      'bgImageId',
      publicId
    ) as Promise<IUserDocument>;

    const bgImageVersion: Promise<IUserDocument> = userCache.updateSingleUserItemInCache(
      `${req.currentUser?.userId}`,
      'bgImageVersion',
      version
    ) as Promise<IUserDocument>;

    const response: [IUserDocument, IUserDocument] = await Promise.all([bgImageId, bgImageVersion]);

    socketIOImageObject.emit('update user', { bgImageId: publicId, bgImageVersion: version, userId: response[0] });

    imageQueue.addImageJob('updateBGImageInDb', {
      key: `${req.currentUser?.userId}`,
      imgId: publicId,
      imgVersion: version
    });

    res.status(StatusCodes.OK).json({ message: 'Image added successfully' });
  }

  private async backgroundUpload(image: string): Promise<IBgUploadResponse> {
    const isDataURL = Helpers.isDataURL(image);
    let version = '';
    let publicId = '';
    if (isDataURL) {
      const uploadResult: UploadApiResponse = (await upload(image)) as UploadApiResponse;
      if (!uploadResult.public_id) {
        throw new BadRequestError(uploadResult.message);
      } else {
        version = uploadResult.version.toString();
        publicId = uploadResult.public_id;
      }
    } else {
      const value = image.split('/');
      version = value[value.length - 2];
      publicId = value[value.length - 1];
    }

    return { version: version.replace(/v/g, ''), publicId };
  }
}
