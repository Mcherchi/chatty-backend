import { config } from '@root/config';
import { userService } from '@service/db/user.service';
import { DoneCallback, Job } from 'bull';
import { Logger } from 'winston';

const log: Logger = config.createLogger('authWorker');

class UserWorker {
  async addUserToDb(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;
      await userService.createUser(value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error('UserWorker.addUserToDb() method error: ', error);
      done(error as Error);
    }
  }
}

export const userWorker: UserWorker = new UserWorker();
