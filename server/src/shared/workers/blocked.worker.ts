import { config } from '@root/config';
import { blockUserService } from '@service/db/block-user.service';
import { DoneCallback, Job } from 'bull';
import { Logger } from 'winston';

const log: Logger = config.createLogger('blockedWorker');

class BlockedUserWorker {
  async updateBlockedUserToDB(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { keyOne, keyTwo, type } = job.data;
      if (type === 'block') {
        await blockUserService.blockUser(keyOne, keyTwo);
      } else {
        await blockUserService.unBlockUser(keyOne, keyTwo);
      }
      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error('BlockedWorker.blockUser() method error: ', error);
      done(error as Error);
    }
  }
}

export const blockedUserWorker: BlockedUserWorker = new BlockedUserWorker();
