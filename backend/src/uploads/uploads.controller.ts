import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Get,
  Param,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import type { Response } from 'express';
import { join } from 'path';
import { existsSync } from 'fs';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          cb(null, join(process.cwd(), 'uploads'));
        },
        filename: (req, file, cb) => {
          const timestamp = Date.now();
          const random = Math.round(Math.random() * 1e9);
          const ext = file.originalname.split('.').pop()?.toLowerCase() || 'jpg';
          cb(null, `${timestamp}-${random}.${ext}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
      fileFilter: (req, file, cb) => {
        const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (allowedMimes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Format non autorisé'), false);
        }
      },
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Aucun fichier fourni');
    }

    return {
      filename: file.filename,
      url: `/api/uploads/${file.filename}`,
      size: file.size,
      mimetype: file.mimetype,
    };
  }

  @Get(':filename')
  serveFile(@Param('filename') filename: string, @Res() res: Response) {
    const filePath = join(process.cwd(), 'uploads', filename);

    if (!existsSync(filePath)) {
      return res.status(404).json({ message: 'Fichier non trouvé' });
    }

    return res.sendFile(filePath);
  }
}
