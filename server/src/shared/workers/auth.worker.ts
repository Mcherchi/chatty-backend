import { DoneCallback, Job } from 'bull';
import { Logger } from 'winston';
import { config } from '@root/config';
import { authService } from '@service/db/auth.service';

const log: Logger = config.createLogger('authWorker');

class AuthWorker {
  async addAuthUserToDb(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { value } = job.data;

      await authService.createAuthUser(value);
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error('AuthWorker.addAuthUserToDb() method error: ', error);
      done(error as Error);
    }
  }
}

export const authWorker: AuthWorker = new AuthWorker();
