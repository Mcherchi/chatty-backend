import { IFileImageJobData } from '@image/interfaces/image.interface';
import { BaseQueue } from './base.queue';
import { imageWorker } from '@worker/image.worker';

class ImageQueue extends BaseQueue {
  constructor() {
    super('images');
    this.processJob('addUserProfileImageToDb', 5, imageWorker.addUserProfileImageToDb);
    this.processJob('updateBGImageInDb', 5, imageWorker.updateBGImageInDb);
    this.processJob('addImageToDb', 5, imageWorker.addImageToDb);
    this.processJob('removeImageFromDb', 5, imageWorker.removeImageFromDb);
  }

  public addImageJob(name: string, data: IFileImageJobData) {
    this.addJob(name, data);
  }
}

export const imageQueue: ImageQueue = new ImageQueue();
