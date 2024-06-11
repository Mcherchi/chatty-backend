import { config } from '@root/config';
import { postService } from '@service/db/post.service';
import { DoneCallback, Job } from 'bull';
import { Logger } from 'winston';

const log: Logger = config.createLogger('postWorker');

class PostWorker {
  async addPostToDb(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { userId, value } = job.data;
      await postService.addPostToDB(userId, value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error('PostWorker.addPostToDb() method error: ', error);
      done(error as Error);
    }
  }

  async deletePostToDb(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo } = job.data;
      await postService.deletePost(keyOne, keyTwo);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error('PostWorker.deletePostToDb() method error: ', error);
      done(error as Error);
    }
  }

  async updatePostToDb(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, value } = job.data;
      await postService.updatePost(keyOne, value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error('PostWorker.updatePostToDb() method error: ', error);
      done(error as Error);
    }
  }
}

export const postWorker: PostWorker = new PostWorker();
