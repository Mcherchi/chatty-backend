import { SignIn } from '@auth/controllers/signin';
import { SignOut } from '@auth/controllers/signout';
import { SignUp } from '@auth/controllers/signup';
import { authMiddleware } from '@global/helpers/auth-middleware';
import express, { Router } from 'express';

class AuthRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.post('/auth/signup', SignUp.prototype.create);
    this.router.post('/auth/signin', SignIn.prototype.read);

    return this.router;
  }

  public signoutRoute(): Router {
    this.router.get('/auth/signout', authMiddleware.checkAuthentication, SignOut.prototype.signout);

    return this.router;
  }
}

export const authRoutes: AuthRoutes = new AuthRoutes();
