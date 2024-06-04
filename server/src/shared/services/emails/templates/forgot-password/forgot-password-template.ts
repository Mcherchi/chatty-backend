import fs from 'fs';
import ejs from 'ejs';
import path from 'path';

class ForgotPasswordTemplate {
  public passwordForgotTemplate(username: string, resetLink: string): string {
    const templatePath = path.join(__dirname, 'forgot-password-template.ejs');
    const templateContent = fs.readFileSync(templatePath, 'utf8');

    return ejs.render(templateContent, {
      username,
      resetLink,
      image_url: 'https://w7.pngwing.com/pngs/120/102/png-transparent-padlock-logo-computer-icons-padlock-technic-logo-password-lock.png'
    });
  }
}

export const forgotPasswordTemplate: ForgotPasswordTemplate = new ForgotPasswordTemplate();
