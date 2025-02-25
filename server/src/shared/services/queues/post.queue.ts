import { IPostJob } from '@post/interfaces/post.interface';
import { BaseQueue } from '@service/queues/base.queue';
import { postWorker } from '@worker/post.worker';

class PostQueue extends BaseQueue {
  constructor() {
    super('post');
    this.processJob('addPostToDB', 5, postWorker.addPostToDb);
    this.processJob('deletePostFromDB', 5, postWorker.deletePostToDb);
    this.processJob('updatePostInDB', 5, postWorker.updatePostToDb);
  }

  public addPostJob(name: string, data: IPostJob): void {
    this.addJob(name, data);
  }
}

export const postQueue: PostQueue = new PostQueue();
