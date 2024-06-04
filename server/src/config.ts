import dotenv from 'dotenv';
import winston, { Logger } from 'winston';
import cloudinary from 'cloudinary';

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
  public CLOUD_NAME: string | undefined;
  public CLOUD_API_KEY: string | undefined;
  public CLOUD_API_SECRETS: string | undefined;
  public BCRYPT_SALT_ROUNDS: string | undefined;
  public SENDER_EMAIL: string | undefined;
  public SENDER_EMAIL_PASSWORD: string | undefined;
  public SENDGRID_API_KEY: string | undefined;
  public SENDGRID_SENDER: string | undefined;

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
    this.CLOUD_NAME = process.env.CLOUD_NAME || '';
    this.CLOUD_API_KEY = process.env.CLOUD_API_KEY || '';
    this.CLOUD_API_SECRETS = process.env.CLOUD_API_SECRETS || '';
    this.BCRYPT_SALT_ROUNDS = process.env.BCRYPT_SALT_ROUNDS || '';
    this.SENDER_EMAIL = process.env.SENDER_EMAIL || '';
    this.SENDER_EMAIL_PASSWORD = process.env.SENDER_EMAIL_PASSWORD || '';
    this.SENDGRID_API_KEY = process.env.SENDGRID_API_KEY || '';
    this.SENDGRID_SENDER = process.env.SENDGRID_SENDER || '';
  }

  public createLogger(name: string): Logger {
    const options = {
      console: {
        level: 'debug',
        handleExceptions: true,
        json: false
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

  public cloudinaryConfig(): void {
    cloudinary.v2.config({
      cloud_name: this.CLOUD_NAME,
      api_key: this.CLOUD_API_KEY,
      api_secret: this.CLOUD_API_SECRETS
    });
  }
}

export const config: Config = new Config();
