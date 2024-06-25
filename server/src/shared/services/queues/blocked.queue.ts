import { IBlockedUserJobData } from '@follower/interfaces/follower.interface';
import { BaseQueue } from '@service/queues/base.queue';
import { blockedUserWorker } from '@worker/blocked.worker';

class BlockedQueue extends BaseQueue {
  constructor() {
    super('blockedUser');
    this.processJob('updateBlockedUserToDB', 5, blockedUserWorker.updateBlockedUserToDB);
  }

  public addBlockedUserJob(name: string, data: IBlockedUserJobData): void {
    this.addJob(name, data);
  }
}

export const blockedQueue: BlockedQueue = new BlockedQueue();
