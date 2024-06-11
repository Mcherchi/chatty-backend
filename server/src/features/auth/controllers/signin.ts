import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { loginSchema } from '@auth/schemes/signin.scheme';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { BadRequestError } from '@global/helpers/error-handler';
import { Helpers } from '@global/helpers/helpers';
import { authService } from '@service/db/auth.service';
import { IUserDocument } from '@user/interfaces/user.interface';
import { userService } from '@service/db/user.service';

export class SignIn {
  @joiValidation(loginSchema)
  public async read(req: Request, res: Response): Promise<void> {
    const { username, password } = req.body;

    const isValidEmail: boolean = Helpers.isEmail(username);

    const existingUser: IAuthDocument | undefined = !isValidEmail
      ? await authService.getAuthUserByUsername(username)
      : await authService.getAuthUserByEmail(username);

    if (!existingUser) {
      throw new BadRequestError('Invalid credentials!');
    }

    const passwordMatch: boolean = await existingUser.comparePassword(password);

    if (!passwordMatch) {
      throw new BadRequestError('Invalid credentials!');
    }

    const user: IUserDocument = await userService.getUserByAuthId(`${existingUser._id}`);

    const userJwt: string = authService.signToken(
      user._id,
      existingUser.uId,
      existingUser.email,
      existingUser.username,
      existingUser.avatarColor
    );

    req.session = { jwt: userJwt };

    const userDocument: IUserDocument = {
      ...user,
      authId: existingUser!._id,
      username: existingUser!.username,
      email: existingUser!.email,
      avatarColor: existingUser!.avatarColor,
      uId: existingUser!.uId,
      createdAt: existingUser!.createdAt
    } as IUserDocument;

    res.status(StatusCodes.OK).json({ message: 'User login successfully', user: userDocument });
  }
}
