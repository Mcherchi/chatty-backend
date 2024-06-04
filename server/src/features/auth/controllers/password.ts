import crypto from 'crypto';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import moment from 'moment';
import publicIP from 'ip';

import { config } from '@root/config';
import { IAuthDocument } from '@auth/interfaces/auth.interface';
import { emailSchema, passwordSchema } from '@auth/schemes/password.scheme';
import { joiValidation } from '@global/decorators/joi-validation.decorators';
import { BadRequestError } from '@global/helpers/error-handler';
import { authService } from '@service/db/auth.service';
import { forgotPasswordTemplate } from '@service/emails/templates/forgot-password/forgot-password-template';
import { emailQueue } from '@service/queues/email.queue';
import { IResetPasswordParams } from '@user/interfaces/user.interface';
import { resetPasswordTemplate } from '@service/emails/templates/reset-password/reset-password-template';
import { AuthModel } from '@auth/models/auth.schema';

export class Password {
  @joiValidation(emailSchema)
  public async forgotPassword(req: Request, res: Response): Promise<void> {
    const { email } = req.body;

    const existingUser: IAuthDocument = await authService.getAuthUserByEmail(email);

    if (!existingUser) {
      throw new BadRequestError('Invalid Credentials!');
    }

    const randomBytes: Buffer = await Promise.resolve(crypto.randomBytes(20));
    const randomCharacters: string = randomBytes.toString('hex');
    const date: Date = new Date();
    date.setHours(date.getHours() + 1);

    await authService.updatePasswordResetToken(`${existingUser._id}`, randomCharacters, date);

    const resetLink = `${config.CLIENT_URL}/reset-password?token=${randomCharacters}`;
    const template: string = forgotPasswordTemplate.passwordForgotTemplate(existingUser.username!, resetLink);
    emailQueue.addEmailJob('forgotPasswordEmailJob', { template, receiverEmail: existingUser.email, subject: 'Reset your password' });

    res.status(StatusCodes.OK).json({ message: 'Reset password email sent successfully' });
  }

  @joiValidation(passwordSchema)
  public async resetPassword(req: Request, res: Response): Promise<void> {
    const { password } = req.body;
    const { token } = req.params;

    const existingUser: IAuthDocument = await authService.getUserByPasswordToken(token);
    if (!existingUser) {
      throw new BadRequestError('Reset Token has expired');
    }

    const hashedPassword: string = await AuthModel.prototype.hashPassword(password);

    await authService.updatePassword(existingUser._id, hashedPassword);

    const templateParams: IResetPasswordParams = {
      username: existingUser.username,
      email: existingUser.email,
      ipaddress: publicIP.address(),
      date: moment().format('DD/MM/YYYY HH:mm')
    };

    const template: string = resetPasswordTemplate.passwordResetTemplate(templateParams);
    emailQueue.addEmailJob('forgotPasswordEmailJob', {
      template,
      receiverEmail: existingUser.email,
      subject: 'Reset Password Confirmation'
    });
    res.status(StatusCodes.OK).json({ message: 'Password successfully updated' });
  }
}
