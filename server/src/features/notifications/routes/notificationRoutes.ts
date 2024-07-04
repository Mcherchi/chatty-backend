import { authMiddleware } from '@global/helpers/auth-middleware';
import { DeleteNotification } from '@notification/controllers/delete-notification';
import { GetNotification } from '@notification/controllers/get-notifications';
import { UpdateNotification } from '@notification/controllers/update-notification';
import express, { Router } from 'express';

class NotificationRoutes {
  private router: Router;

  constructor() {
    this.router = express.Router();
  }

  public routes(): Router {
    this.router.put('/notification/:notificationId', authMiddleware.checkAuthentication, UpdateNotification.prototype.update);
    this.router.delete('/notification/:notificationId', authMiddleware.checkAuthentication, DeleteNotification.prototype.delete);
    this.router.get('/notifications', authMiddleware.checkAuthentication, GetNotification.prototype.get);

    return this.router;
  }
}

export const notificationRoutes: NotificationRoutes = new NotificationRoutes();
