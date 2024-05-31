import { CurrentUser } from '@auth/controllers/current-user';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';

class CurrentRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.get('/auth/currentuser', authMiddleware.checkAuthentication, CurrentUser.prototype.currentUser);

    return this.router;
  }
}

export const currentRoutes: CurrentRoutes = new CurrentRoutes();
