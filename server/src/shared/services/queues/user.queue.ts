import { userWorker } from '@worker/user.worker';
import { BaseQueue } from '@service/queues/base.queue';
import { IUserJob } from '@user/interfaces/user.interface';

class UserQueue extends BaseQueue {
  constructor() {
    super('user');
    this.processJob('addUserToDb', 5, userWorker.addUserToDb);
  }

  public addUserJob(name: string, data: IUserJob): void {
    this.addJob(name, data);
  }
}

export const userQueue: UserQueue = new UserQueue();
