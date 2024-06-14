import { userService } from '@service/db/user.service';
import { userCache } from '@service/redis/user.cache';
import { IUserDocument } from '@user/interfaces/user.interface';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class CurrentUser {
  public async currentUser(req: Request, res: Response): Promise<void> {
    let isUser = false;

    let user = null;

    const cachedUser: IUserDocument = (await userCache.getUserFromCache(`${req.currentUser?.userId}`)) as IUserDocument;

    const existingUser: IUserDocument = cachedUser
      ? cachedUser
      : ((await userService.getUserById(`${req.currentUser?.userId}`)) as IUserDocument);

    if (Object.keys(existingUser).length) {
      isUser = true;
      user = existingUser;
    }

    res.status(StatusCodes.OK).json({ message: 'Authenticated user', user, isUser });
  }
}
