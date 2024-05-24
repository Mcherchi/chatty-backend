import dotenv from 'dotenv';
import winston, { Logger } from 'winston';

dotenv.config({});

class Config {
  public MONGO_URL: string | undefined;
  public REDIS_HOST: string | undefined;
  public JWT_TOKEN: string | undefined;
  public NODE_ENV: string | undefined;
  public SECRET_KEY_ONE: string | undefined;
  public SECRET_KEY_TWO: string | undefined;
  public CLIENT_URL: string | undefined;
  public SERVER_PORT: string | undefined;

  private readonly DEFAULT_SERVER_PORT = '4000';

  constructor() {
    this.MONGO_URL = process.env.MONGO_URL || '';
    this.REDIS_HOST = process.env.REDIS_HOST || '';
    this.JWT_TOKEN = process.env.JWT_TOKEN || '1234';
    this.NODE_ENV = process.env.NODE_ENV || '';
    this.SECRET_KEY_ONE = process.env.SECRET_KEY_ONE || '';
    this.SECRET_KEY_TWO = process.env.SECRET_KEY_TWO || '';
    this.CLIENT_URL = process.env.CLIENT_URL || '';
    this.SERVER_PORT = process.env.SERVER_PORT || this.DEFAULT_SERVER_PORT;
  }

  public createLogger(name: string): Logger {
    const options = {
      console: {
        level: 'debug',
        handleExceptions: true,
        json: false,
        colorize: true
      }
    };

    const customFormat = winston.format.combine(
      winston.format.colorize(),
      winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
      winston.format.printf(({ timestamp, level, message, service }) => {
        return `${timestamp} [${service}] ${level}: ${message}`;
      })
    );

    return winston.createLogger({
      level: 'debug',
      format: customFormat,
      defaultMeta: { service: name },
      transports: [new winston.transports.Console(options.console)],
      exitOnError: false
    });
  }

  public validateConfig(): void {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) {
        throw new Error(`Configuration ${key} is undefined`);
      }
    }
  }
}

export const config: Config = new Config();
