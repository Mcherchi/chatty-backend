import { IFileImageDocument } from '@image/interfaces/image.interface';
import { imageService } from '@service/db/image.service';
import { Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';

export class GetImage {
  public async images(req: Request, res: Response): Promise<void> {
    const images: IFileImageDocument[] = await imageService.getImages(req.params.userId);
    res.status(StatusCodes.OK).json({ message: 'User Images', images });
  }
}
