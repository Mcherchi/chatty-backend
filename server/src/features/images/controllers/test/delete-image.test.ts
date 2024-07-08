import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/auth.mock';
import * as imageServer from '@socket/image.socket';
import { imagesMockRequest, imagesMockResponse } from '@root/mocks/image.mock';
import { imageQueue } from '@service/queues/image.queue';
import { DeleteImage } from '@image/controllers/delete-image';
// import { imageService } from '@service/db/image.service';
// import { UserCache } from '@service/redis/user.cache';
// import { userService } from '@service/db/user.service';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/user.cache');

Object.defineProperties(imageServer, {
  socketIOImageObject: {
    value: new Server(),
    writable: true
  }
});

describe('Delete', () => {
  beforeEach(() => {
    jest.restoreAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should send correct json response for image upload', async () => {
    const req: Request = imagesMockRequest({}, {}, authUserPayload, { imageId: '12345' }) as Request;
    const res: Response = imagesMockResponse();
    jest.spyOn(imageServer.socketIOImageObject, 'emit');
    jest.spyOn(imageQueue, 'addImageJob');

    await DeleteImage.prototype.image(req, res);
    expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith('delete image', req.params.imageId);
    expect(imageQueue.addImageJob).toHaveBeenCalledWith('removeImageFromDb', { imageId: req.params.imageId });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Image deleted successfully'
    });
  });

  // it('should send correct json response for background image upload', async () => {
  //   const req: Request = imagesMockRequest({}, {}, authUserPayload, { imageId: '12345' }) as Request;
  //   const res: Response = imagesMockResponse();

  //   jest.spyOn(imageServer.socketIOImageObject, 'emit');
  //   jest.spyOn(imageQueue, 'addImageJob');
  //   jest.spyOn(imageService, 'getImageByBackgroundId').mockResolvedValue(fileDocumentMock);
  //   jest.spyOn(imageService, 'getImageByBackgroundId').mockResolvedValue(fileDocumentMock);
  //   jest.spyOn(UserCache.prototype, 'updateSingleUserItemInCache');
  //   jest.spyOn(userService, 'removeUserBackgroundImage');

  //   await DeleteImage.prototype.backgroundImage(req, res);

  //   expect(imageServer.socketIOImageObject.emit).toHaveBeenCalledWith('delete image', req.params.imageId);
  //   expect(imageQueue.addImageJob).toHaveBeenCalledWith('removeImageFromDb', { imageId: req.params.imageId });
  //   expect(UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(`${req.currentUser?.userId}`, 'bgImageId', '');
  //   expect(UserCache.prototype.updateSingleUserItemInCache).toHaveBeenCalledWith(`${req.currentUser?.userId}`, 'bgImageVersion', '');
  //   expect(userService.removeUserBackgroundImage).toHaveBeenCalledWith(`${req.currentUser?.userId}`);
  //   expect(res.status).toHaveBeenCalledWith(200);
  //   expect(res.json).toHaveBeenCalledWith({
  //     message: 'Image deleted successfully'
  //   });
  // });
});
