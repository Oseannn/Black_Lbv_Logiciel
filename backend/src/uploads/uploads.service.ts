import { Injectable, BadRequestException } from '@nestjs/common';
import { join } from 'path';
import { existsSync, mkdirSync, unlinkSync } from 'fs';

@Injectable()
export class UploadsService {
  private readonly uploadDir = join(process.cwd(), 'uploads');

  constructor() {
    // Ensure upload directory exists
    if (!existsSync(this.uploadDir)) {
      mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  getUploadPath(): string {
    return this.uploadDir;
  }

  generateFileName(originalName: string): string {
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = originalName.split('.').pop()?.toLowerCase() || 'jpg';
    return `${timestamp}-${random}.${ext}`;
  }

  getFileUrl(filename: string): string {
    return `/uploads/${filename}`;
  }

  deleteFile(filename: string): boolean {
    try {
      const filePath = join(this.uploadDir, filename);
      if (existsSync(filePath)) {
        unlinkSync(filePath);
        return true;
      }
      return false;
    } catch {
      return false;
    }
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
