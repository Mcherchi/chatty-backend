import { config } from '@root/config';
import { imageService } from '@service/db/image.service';
import { DoneCallback, Job } from 'bull';
import { Logger } from 'winston';

const log: Logger = config.createLogger('imageWorker');

class ImageWorker {
  async addUserProfileImageToDb(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, value, imgId, imgVersion } = job.data;
      await imageService.addUserProfileImageToDb(key, value, imgId, imgVersion);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error('ImageWorker.addUserProfileImageToDb() method error: ', error);
      done(error as Error);
    }
  }

  async updateBGImageInDb(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, imgId, imgVersion } = job.data;
      await imageService.addBackgroundImageToDb(key, imgId, imgVersion);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error('ImageWorker.updateBGImageInDb() method error: ', error);
      done(error as Error);
    }
  }

  async addImageToDb(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { key, imgId, imgVersion } = job.data;
      await imageService.addImage(key, imgId, imgVersion, '');
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error('ImageWorker.addImageToDb() method error: ', error);
      done(error as Error);
    }
  }

  async removeImageFromDb(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { imageId } = job.data;
      await imageService.removeImageFromDb(imageId);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error('ImageWorker.removeImageFromDb() method error: ', error);
      done(error as Error);
    }
  }
}

export const imageWorker: ImageWorker = new ImageWorker();
