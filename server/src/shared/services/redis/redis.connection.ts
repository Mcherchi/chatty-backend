// import { Logger } from 'winston';
// import { config } from '@root/config';
import { BaseCache } from '@service/redis/base.cache';

// const log: Logger = config.createLogger('redisConnection');

class RedisConnection extends BaseCache {
  constructor() {
    super('redisConnection');
  }

  async connect(): Promise<void> {
    try {
      await this.client.connect();
      this.log.info(`Redis connection: ${await this.client.ping()}`);
    } catch (error) {
      this.log.error('RedisConnection.connect() method error: ', error);
    }
  }
}

export const redisConnection: RedisConnection = new RedisConnection();
