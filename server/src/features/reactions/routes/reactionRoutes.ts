import { authMiddleware } from '@global/helpers/auth-middleware';
import { AddReaction } from '@reaction/controllers/add-reactions';
import { GetReaction } from '@reaction/controllers/get-reactions';
import { RemoveReaction } from '@reaction/controllers/remove-reaction';
import express, { Router } from 'express';

class ReactionRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/post/reactions/:postId', authMiddleware.checkAuthentication, GetReaction.prototype.reactions);
    this.router.get(
      '/post/single/reaction/username/:postId/:username',
      authMiddleware.checkAuthentication,
      GetReaction.prototype.singleReactionByUsername
    );
    this.router.get('/post/reactions/username/:username', authMiddleware.checkAuthentication, GetReaction.prototype.reactionsByUsername);

    this.router.post('/post/reaction', authMiddleware.checkAuthentication, AddReaction.prototype.reaction);

    this.router.delete(
      '/post/reaction/:postId/:previousReaction/:postReaction',
      authMiddleware.checkAuthentication,
      RemoveReaction.prototype.reaction
    );

    return this.router;
  }
}

export const reactionRoutes: ReactionRoutes = new ReactionRoutes();
