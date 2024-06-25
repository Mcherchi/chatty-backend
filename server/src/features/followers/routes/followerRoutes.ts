import { AddBlockUser } from '@follower/controllers/block-user';
import { AddFollower } from '@follower/controllers/follower-user';
import { GetFollowers } from '@follower/controllers/get-followers';
import { RemoveFollower } from '@follower/controllers/unfollow-user';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';

class FollowerRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.put('/user/follow/:followerId', authMiddleware.checkAuthentication, AddFollower.prototype.follower);
    this.router.put('/user/unfollow/:followerId', authMiddleware.checkAuthentication, RemoveFollower.prototype.follower);
    this.router.put('/user/block/:followerId', authMiddleware.checkAuthentication, AddBlockUser.prototype.blockUser);
    this.router.put('/user/unblock/:followerId', authMiddleware.checkAuthentication, AddBlockUser.prototype.unBlockUser);

    this.router.get('/user/following', authMiddleware.checkAuthentication, GetFollowers.prototype.userFollowing);
    this.router.get('/user/followers/:userId', authMiddleware.checkAuthentication, GetFollowers.prototype.userFollowers);

    return this.router;
  }
}

export const followerRoutes: FollowerRoutes = new FollowerRoutes();
