import { AddComment } from '@comment/controllers/add-comment';
import { GetComment } from '@comment/controllers/get-comment';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';

class CommentRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/post/comment', authMiddleware.checkAuthentication, AddComment.prototype.comment);

    this.router.get('/post/comments/:postId', authMiddleware.checkAuthentication, GetComment.prototype.comments);
    this.router.get('/post/commentsnames/:postId', authMiddleware.checkAuthentication, GetComment.prototype.commentsNames);
    this.router.get('/post/single/comment/:postId/:commentId', authMiddleware.checkAuthentication, GetComment.prototype.singleComment);

    return this.router;
  }
}

export const commentRoutes: CommentRoutes = new CommentRoutes();
