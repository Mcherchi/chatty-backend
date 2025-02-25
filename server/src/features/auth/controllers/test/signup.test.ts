/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import * as cloudinaryUploads from '@global/helpers/cloudinary-upload';
import { authMock, authMockRequest, authMockResponse } from '@root/mocks/auth.mock';
import { SignUp } from '@auth/controllers/signup';
import { CustomError } from '@global/helpers/error-handler';
import { authService } from '@service/db/auth.service';
import { UserCache } from '@service/redis/user.cache';

jest.useFakeTimers();
jest.mock('@service/redis/user.cache');
jest.mock('@service/queues/base.queue');
jest.mock('@service/queues/user.queue');
jest.mock('@service/queues/auth.queue');
jest.mock('@global/helpers/cloudinary-upload');

describe('SignUp', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });

  it('should throw an error if username is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: '',
        email: 'manny@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plan;base64,SVGsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse() as Response;

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Username is a required field');
    });
  });

  it('should throw an error if username length is less than minimum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'ma',
        email: 'manny@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plan;base64,SVGsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse() as Response;

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if username length is greater than maximum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'mathematics',
        email: 'manny@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plan;base64,SVGsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse() as Response;

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid username');
    });
  });

  it('should throw an error if email is not valid', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Manny',
        email: 'not valid',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plan;base64,SVGsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse() as Response;

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email must be valid');
    });
  });

  it('should throw an error if email is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Manny',
        email: '',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plan;base64,SVGsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse() as Response;

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Email is a required field');
    });
  });

  it('should throw an error if password is not available', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Manny',
        email: 'manny@test.com',
        password: '',
        avatarColor: 'red',
        avatarImage: 'data:text/plan;base64,SVGsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse() as Response;

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Password is a required field');
    });
  });

  it('should throw an error if password length is less than minimum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Manny',
        email: 'manny@test.com',
        password: 'qw',
        avatarColor: 'red',
        avatarImage: 'data:text/plan;base64,SVGsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse() as Response;

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw an error if password length is greater than maximum length', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Manny',
        email: 'manny@test.com',
        password: 'qw',
        avatarColor: 'red',
        avatarImage: 'data:text/plan;base64,SVGsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse() as Response;

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid password');
    });
  });

  it('should throw unauthorize error if user already exists', () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Manny',
        email: 'manny@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plan;base64,SVGsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse() as Response;

    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(authMock);

    SignUp.prototype.create(req, res).catch((error: CustomError) => {
      expect(error.statusCode).toEqual(400);
      expect(error.serializeErrors().message).toEqual('Invalid credentials');
    });
  });

  it('should set session data for valid credentials and send correct json response', async () => {
    const req: Request = authMockRequest(
      {},
      {
        username: 'Manny',
        email: 'manny@test.com',
        password: 'qwerty',
        avatarColor: 'red',
        avatarImage: 'data:text/plan;base64,SVGsbG8sIFdvcmxkIQ=='
      }
    ) as Request;

    const res: Response = authMockResponse() as Response;
    jest.spyOn(authService, 'getUserByUsernameOrEmail').mockResolvedValue(null as any);
    const userSpy = jest.spyOn(UserCache.prototype, 'saveUserToCache');
    jest.spyOn(cloudinaryUploads, 'upload').mockImplementation((): any => Promise.resolve({ version: '123456789', public_id: '123456' }));

    await SignUp.prototype.create(req, res);

    expect(req.session?.jwt).toBeDefined();
    expect(res.json).toHaveBeenCalledWith({
      message: 'User created successfully',
      user: userSpy.mock.calls[0][2]
    });
  });
});
