import Queue, { Job } from 'bull';
import { Logger } from 'winston';
import { createBullBoard } from '@bull-board/api';
import { BullAdapter } from '@bull-board/api/bullAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { config } from '@root/config';
import { IAuthJob } from '@auth/interfaces/auth.interface';
import { IEmailJob, IUserJob } from '@user/interfaces/user.interface';
import { IPostJob } from '@post/interfaces/post.interface';

type IBaseJobData = IAuthJob | IUserJob | IEmailJob | IPostJob;

let bullAdapters: BullAdapter[] = [];

export let serverAdapter: ExpressAdapter;

export abstract class BaseQueue {
  queue: Queue.Queue;
  log: Logger;
  constructor(queueName: string) {
    this.queue = new Queue(queueName, `${config.REDIS_HOST}`);
    bullAdapters.push(new BullAdapter(this.queue));
    bullAdapters = Array.from(new Set(bullAdapters));
    this.initializeBullBoard();

    this.log = config.createLogger(`${queueName}Queue`);

    this.queue.on('completed', (job: Job) => {
      job.remove();
    });

    this.queue.on('global:completed', (jobId: string) => {
      this.log.info(`Job ${jobId} completed`);
    });

    this.queue.on('global:stalled', (jobId: string) => {
      this.log.info(`Job ${jobId} is stalled`);
    });

    this.queue.on('failed', (job: Job, err: Error) => {
      this.log.error(`Job ${job.id} failed with error ${err.message}`);
    });

    this.queue.on('global:failed', (jobId: string, err: Error) => {
      this.log.error(`Job ${jobId} failed globally with error ${err.message}`);
    });

    this.processFailedJobs();
  }

  protected addJob(name: string, data: IBaseJobData): void {
    this.queue.add(name, data, { attempts: 3, backoff: { type: 'fixed', delay: 5000 } });
  }

  protected processJob(name: string, concurrency: number, callBack: Queue.ProcessCallbackFunction<void>): void {
    this.queue.process(name, concurrency, callBack);
  }

  private initializeBullBoard(): void {
    serverAdapter = new ExpressAdapter();
    serverAdapter.setBasePath('/queues');

    createBullBoard({
      queues: bullAdapters,
      serverAdapter
    });
  }

  private async processFailedJobs(): Promise<void> {
    const failedJobs = await this.queue.getFailed();
    const retryPromises = failedJobs.map(async (job) => {
      try {
        this.log.info(`Reprocessing failed job ${job.id}`);
        await job.retry();
      } catch (error) {
        this.log.error(`Failed to reprocess job ${job.id} with error ${error}`);
      }
    });

    await Promise.all(retryPromises);
  }
}
