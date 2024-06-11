/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import { Server } from 'socket.io';
import { authUserPayload } from '@root/mocks/auth.mock';
import * as postServer from '@socket/post.socket';
import { postMockData, postMockRequest, postMockResponse, updatedPost, updatedPostWithImage } from '@root/mocks/post.mock';
import { PostCache } from '@service/redis/post.cache';
import { postQueue } from '@service/queues/post.queue';
import { UpdatePost } from '@post/controllers/update-post';
import * as cloudinaryUploads from '@global/helpers/cloudinary-upload';

jest.useFakeTimers();
jest.mock('@service/queues/base.queue');
jest.mock('@service/redis/post.cache');
jest.mock('@global/helpers/cloudinary-upload');

Object.defineProperties(postServer, {
  socketIOPostObject: {
    value: new Server(),
    writable: true
  }
});

describe('UpdatePost', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
  });
  describe('update', () => {
    it('should send correct json response', async () => {
      const req: Request = postMockRequest(updatedPost, authUserPayload, { postId: `${postMockData._id}` }) as Request;
      const res: Response = postMockResponse();
      const postSpy = jest.spyOn(PostCache.prototype, 'updatePostInCache').mockImplementationOnce(() => Promise.resolve(postMockData));
      jest.spyOn(postServer.socketIOPostObject, 'emit');
      jest.spyOn(postQueue, 'addPostJob');

      await UpdatePost.prototype.update(req, res);
      expect(postSpy).toHaveBeenCalledWith(`${postMockData._id}`, updatedPost);
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('updated post', postMockData);
      expect(postQueue.addPostJob).toHaveBeenCalledWith('updatePostInDB', { keyOne: `${postMockData._id}`, value: postMockData });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post updated successfully'
      });
    });
  });

  describe('updateWithImage', () => {
    it('should send correct json response if imgId and imgVersion exists', async () => {
      updatedPostWithImage.imgId = '1234';
      updatedPostWithImage.imgVersion = '1234';
      updatedPost.imgId = '1234';
      updatedPost.imgVersion = '1234';
      updatedPost.post = updatedPostWithImage.post;
      updatedPostWithImage.image = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
      updatedPost.post = updatedPostWithImage.post;
      const req: Request = postMockRequest(updatedPostWithImage, authUserPayload, { postId: `${postMockData._id}` }) as Request;
      const res: Response = postMockResponse();
      const postSpy = jest.spyOn(PostCache.prototype, 'updatePostInCache').mockImplementationOnce(() => Promise.resolve(postMockData));
      jest.spyOn(postServer.socketIOPostObject, 'emit');
      jest.spyOn(postQueue, 'addPostJob');

      await UpdatePost.prototype.updateWithImage(req, res);
      expect(PostCache.prototype.updatePostInCache).toHaveBeenCalledWith(`${postMockData._id}`, postSpy.mock.calls[0][1]);
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('updated post', postMockData);
      expect(postQueue.addPostJob).toHaveBeenCalledWith('updatePostInDB', { keyOne: `${postMockData._id}`, value: postMockData });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post with image updated successfully'
      });
    });

    it('should send correct json response if no imgId and imgVersion', async () => {
      updatedPostWithImage.imgId = '';
      updatedPostWithImage.imgVersion = '';
      updatedPost.imgId = '';
      updatedPost.imgVersion = '';
      updatedPost.post = updatedPostWithImage.post;
      updatedPostWithImage.image = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
      updatedPostWithImage.image = 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==';
      const req: Request = postMockRequest(updatedPostWithImage, authUserPayload, { postId: `${postMockData._id}` }) as Request;
      const res: Response = postMockResponse();
      const postSpy = jest.spyOn(PostCache.prototype, 'updatePostInCache').mockImplementationOnce(() => Promise.resolve(postMockData));
      jest.spyOn(cloudinaryUploads, 'upload').mockImplementation((): any => Promise.resolve({ version: '1234', public_id: '123456' }));
      jest.spyOn(postServer.socketIOPostObject, 'emit');
      jest.spyOn(postQueue, 'addPostJob');

      await UpdatePost.prototype.updateWithImage(req, res);
      expect(PostCache.prototype.updatePostInCache).toHaveBeenCalledWith(`${postMockData._id}`, postSpy.mock.calls[0][1]);
      expect(postServer.socketIOPostObject.emit).toHaveBeenCalledWith('updated post', postMockData);
      expect(postQueue.addPostJob).toHaveBeenCalledWith('updatePostInDB', { keyOne: `${postMockData._id}`, value: postMockData });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: 'Post with image updated successfully'
      });
    });
  });
});
