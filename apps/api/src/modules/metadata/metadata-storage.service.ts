import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { SupabaseStorageService } from '../supabase/supabase-storage.service';
import { IPFSService } from './ipfs.service';
import sharp from 'sharp';

export interface MediaUploadResult {
  url: string;
  ipfsCid?: string;
  variants?: {
    original: string;
    '512': string;
    '256': string;
    '64': string;
  };
}

@Injectable()
export class MetadataStorageService {
  private readonly logger = new Logger(MetadataStorageService.name);
  private readonly BUCKET_NAME = 'metadata-media';
  private readonly MAX_FILE_SIZE = 1024 * 1024; // 1MB
  private readonly ALLOWED_MIME_TYPES = [
    'image/png',
    'image/jpeg',
    'image/jpg',
    'image/svg+xml',
    'image/webp',
  ];

  constructor(
    private readonly storageService: SupabaseStorageService,
    private readonly ipfsService: IPFSService,
  ) {}

  /**
   * Upload and process media file (logo or banner)
   */
  async uploadMedia(
    file: any, // Express.Multer.File
    kind: 'logo' | 'banner',
    userId: string,
  ): Promise<MediaUploadResult> {
    // Validate file
    this.validateFile(file);

    // Generate unique filename
    const timestamp = Date.now();
    const extension = this.getFileExtension(file.originalname);
    const filename = `${kind}-${timestamp}-${userId.substring(0, 8)}${extension}`;
    const path = `${kind}s/${filename}`;

    // Upload original
    const fileBuffer = Buffer.from(file.buffer);
    await this.storageService.upload(this.BUCKET_NAME, path, fileBuffer, {
      contentType: file.mimetype,
      upsert: false,
      metadata: {
        originalName: file.originalname,
        kind,
        uploadedBy: userId,
      },
    });

    const baseUrl = this.storageService.getPublicUrl(this.BUCKET_NAME, path);

    // Generate variants for logos (not banners)
    let variants: MediaUploadResult['variants'] | undefined;
    if (kind === 'logo') {
      variants = await this.generateImageVariants(fileBuffer, path, userId);
    }

    // Pin to IPFS (optional, non-blocking)
    const ipfsCid = await this.ipfsService.pinFile(fileBuffer, filename);

    return {
      url: baseUrl,
      variants,
      ipfsCid: ipfsCid || undefined,
    };
  }

  /**
   * Validate uploaded file
   */
  private validateFile(file: any): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (file.size > this.MAX_FILE_SIZE) {
      throw new BadRequestException(
        `File size exceeds maximum of ${this.MAX_FILE_SIZE / 1024}KB`,
      );
    }

    if (!this.ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: ${this.ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }
  }

  /**
   * Generate image variants (512, 256, 64)
   */
  private async generateImageVariants(
    originalBuffer: Buffer,
    originalPath: string,
    userId: string,
  ): Promise<MediaUploadResult['variants']> {
    const basePath = originalPath.replace(/\.[^/.]+$/, '');
    const variants: MediaUploadResult['variants'] = {
      original: this.storageService.getPublicUrl(
        this.BUCKET_NAME,
        originalPath,
      ),
      '512': '',
      '256': '',
      '64': '',
    };

    // Generate 512x512
    const size512 = await sharp(originalBuffer)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer();
    await this.storageService.upload(
      this.BUCKET_NAME,
      `${basePath}-512.png`,
      size512,
      { contentType: 'image/png' },
    );
    variants['512'] = this.storageService.getPublicUrl(
      this.BUCKET_NAME,
      `${basePath}-512.png`,
    );

    // Generate 256x256
    const size256 = await sharp(originalBuffer)
      .resize(256, 256, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer();
    await this.storageService.upload(
      this.BUCKET_NAME,
      `${basePath}-256.png`,
      size256,
      { contentType: 'image/png' },
    );
    variants['256'] = this.storageService.getPublicUrl(
      this.BUCKET_NAME,
      `${basePath}-256.png`,
    );

    // Generate 64x64
    const size64 = await sharp(originalBuffer)
      .resize(64, 64, {
        fit: 'contain',
        background: { r: 255, g: 255, b: 255, alpha: 0 },
      })
      .png()
      .toBuffer();
    await this.storageService.upload(
      this.BUCKET_NAME,
      `${basePath}-64.png`,
      size64,
      { contentType: 'image/png' },
    );
    variants['64'] = this.storageService.getPublicUrl(
      this.BUCKET_NAME,
      `${basePath}-64.png`,
    );

    return variants;
  }

  /**
   * Get file extension
   */
  private getFileExtension(filename: string): string {
    const lastDot = filename.lastIndexOf('.');
    return lastDot !== -1 ? filename.substring(lastDot) : '.png';
  }

  /**
   * Pin file to IPFS (future enhancement)
   */
  // private async pinToIPFS(buffer: Buffer): Promise<string> {
  //   // Would integrate with Pinata, web3.storage, or IPFS node
  //   // For now, return null
  //   return null;
  // }
}
