import { IFileImageDocument } from '@image/interfaces/image.interface';
import { imageService } from '@service/db/image.service';
import { userService } from '@service/db/user.service';
import { imageQueue } from '@service/queues/image.queue';
import { userCache } from '@service/redis/user.cache';
import { socketIOImageObject } from '@socket/image.socket';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class DeleteImage {
  public async image(req: Request, res: Response): Promise<void> {
    const { imageId } = req.params;
    socketIOImageObject.emit('delete image', imageId);
    imageQueue.addImageJob('removeImageFromDb', {
      imageId
    });

    res.status(StatusCodes.OK).json({ message: 'Image deleted successfully' });
  }

  public async backgroundImage(req: Request, res: Response): Promise<void> {
    const image: IFileImageDocument = await imageService.getImageByBackgroundId(req.params.bgImageId);
    socketIOImageObject.emit('delete image', image?._id);

    const bgImageId: Promise<IUserDocument> = userCache.updateSingleUserItemInCache(
      `${req.currentUser?.userId}`,
      'bgImageId',
      ''
    ) as Promise<IUserDocument>;

    const bgImageVersion: Promise<IUserDocument> = userCache.updateSingleUserItemInCache(
      `${req.currentUser?.userId}`,
      'bgImageVersion',
      ''
    ) as Promise<IUserDocument>;

    await Promise.all([bgImageId, bgImageVersion]);

    await userService.removeUserBackgroundImage(`${req.currentUser?.userId}`);

    imageQueue.addImageJob('removeImageFromDb', {
      imageId: `${image?._id}`
    });

    res.status(StatusCodes.OK).json({ message: 'Image deleted successfully' });
  }
}
