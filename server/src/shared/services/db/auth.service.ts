import { ObjectId } from 'mongodb';
import { sign } from 'jsonwebtoken';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { AuthModel } from '@auth/models/auth.schema';
import { Helpers } from '@global/helpers/helpers';
import { config } from '@root/config';

class AuthService {
  public async createAuthUser(data: IAuthDocument): Promise<void> {
    await AuthModel.create(data);
  }

  public async getUserByUsernameOrEmail(username: string, email: string): Promise<IAuthDocument> {
    const query = {
      $or: [{ username: Helpers.firstLetterUppercase(username) }, { email: Helpers.lowerCase(email) }]
    };

    const user: IAuthDocument = (await AuthModel.findOne(query).exec()) as IAuthDocument;

    return user;
  }

  public async getAuthUserByUsername(username: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({ username: Helpers.firstLetterUppercase(username) }).exec()) as IAuthDocument;
    return user;
  }

  public async getAuthUserByEmail(email: string): Promise<IAuthDocument> {
    const user: IAuthDocument = (await AuthModel.findOne({ email: Helpers.lowerCase(email) }).exec()) as IAuthDocument;
    return user;
  }

  public signToken(userId: ObjectId | string, uId: string, email: string, username: string): string {
    return sign(
      {
        userId,
        uId,
        email,
        username
      },
      `${config.JWT_TOKEN}`
    );
  }
}

export const authService: AuthService = new AuthService();
