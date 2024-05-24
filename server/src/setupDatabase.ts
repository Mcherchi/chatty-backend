import mongoose from 'mongoose';
import { config } from './config';
import { Logger } from 'winston';

const log: Logger = config.createLogger('setUpDatabase');

export default () => {
  const connect = () => {
    mongoose
      .connect(`${config.MONGO_URL}`)
      .then(() => {
        log.info('Successfully connected to database');
      })
      .catch((err) => {
        log.error('Error connecting to database. Exiting now...', err);
        process.exit(1);
      });
  };

  connect();

  mongoose.connection.on('disconnected', () => {
    log.info('Disconnected from database. Reconnecting...');
    setTimeout(connect, 5000);
  });

  mongoose.connection.on('error', (err) => {
    log.error('Database connection error:', err.message);
  });

  mongoose.connection.on('reconnected', () => {
    log.info('Reconnected to database');
  });
};
