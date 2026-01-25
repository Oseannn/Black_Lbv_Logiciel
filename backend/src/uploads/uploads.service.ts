import { Injectable, BadRequestException } from '@nestjs/common';
import { CloudinaryService } from '../cloudinary/cloudinary.service';

@Injectable()
export class UploadsService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadImage(
    file: Express.Multer.File,
    folder: string = 'osean',
  ): Promise<string> {
    this.validateImage(file);
    return await this.cloudinaryService.uploadImage(file, folder);
  }

  async deleteImage(url: string): Promise<void> {
    const publicId = this.cloudinaryService.extractPublicId(url);
    await this.cloudinaryService.deleteImage(publicId);
  }

  validateImage(file: Express.Multer.File): void {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!allowedMimes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Format de fichier non autorisé. Utilisez JPG, PNG, GIF ou WebP.',
      );
    }

    if (file.size > maxSize) {
      throw new BadRequestException(
        'Le fichier est trop volumineux. Taille maximum: 5MB.',
      );
    }
  }
}
