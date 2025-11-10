import { Injectable, Logger } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SupabaseService } from './supabase.service';

/**
 * Supabase Storage Service
 *
 * Provides file storage and management via Supabase Storage:
 * - File uploads
 * - File downloads
 * - File deletion
 * - Public/private buckets
 * - File metadata
 *
 * @class SupabaseStorageService
 * @example
 * ```typescript
 * // Upload file
 * const { path } = await supabaseStorageService.upload(
 *   'avatars',
 *   'user-123.jpg',
 *   fileBuffer
 * );
 *
 * // Get public URL
 * const url = supabaseStorageService.getPublicUrl('avatars', 'user-123.jpg');
 * ```
 */
@Injectable()
export class SupabaseStorageService {
  private readonly logger = new Logger(SupabaseStorageService.name);
  private supabase: SupabaseClient;

  constructor(private supabaseService: SupabaseService) {
    this.supabase = this.supabaseService.getClient();
  }

  /**
   * Uploads a file to Supabase Storage.
   *
   * @param {string} bucket - Bucket name
   * @param {string} path - File path
   * @param {Buffer | File} file - File data
   * @param {object} options - Upload options
   * @returns {Promise<{ path: string }>} Uploaded file path
   */
  async upload(
    bucket: string,
    path: string,
    file: Buffer | File,
    options?: {
      contentType?: string;
      upsert?: boolean;
      metadata?: Record<string, string>;
    },
  ): Promise<{ path: string }> {
    if (!this.supabase) {
      throw new Error('Supabase not configured');
    }

    const fileOptions: any = {
      contentType: options?.contentType,
      upsert: options?.upsert || false,
    };

    if (options?.metadata) {
      fileOptions.metadata = options.metadata;
    }

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, fileOptions);

    if (error) {
      this.logger.error(`Upload error: ${error.message}`);
      throw new Error(`Upload failed: ${error.message}`);
    }

    this.logger.log(`File uploaded: ${bucket}/${data.path}`);
    return { path: data.path };
  }

  /**
   * Downloads a file from Supabase Storage.
   *
   * @param {string} bucket - Bucket name
   * @param {string} path - File path
   * @returns {Promise<Blob>} File data
   */
  async download(bucket: string, path: string): Promise<Blob> {
    if (!this.supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .download(path);

    if (error) {
      this.logger.error(`Download error: ${error.message}`);
      throw new Error(`Download failed: ${error.message}`);
    }

    return data;
  }

  /**
   * Deletes a file from Supabase Storage.
   *
   * @param {string} bucket - Bucket name
   * @param {string} path - File path
   * @returns {Promise<void>}
   */
  async delete(bucket: string, path: string): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase not configured');
    }

    const { error } = await this.supabase.storage.from(bucket).remove([path]);

    if (error) {
      this.logger.error(`Delete error: ${error.message}`);
      throw new Error(`Delete failed: ${error.message}`);
    }

    this.logger.log(`File deleted: ${bucket}/${path}`);
  }

  /**
   * Gets a public URL for a file.
   *
   * @param {string} bucket - Bucket name
   * @param {string} path - File path
   * @returns {string} Public URL
   */
  getPublicUrl(bucket: string, path: string): string {
    if (!this.supabase) {
      throw new Error('Supabase not configured');
    }

    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  /**
   * Gets a signed URL for a private file.
   *
   * @param {string} bucket - Bucket name
   * @param {string} path - File path
   * @param {number} expiresIn - Expiration time in seconds
   * @returns {Promise<string>} Signed URL
   */
  async getSignedUrl(
    bucket: string,
    path: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    if (!this.supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .createSignedUrl(path, expiresIn);

    if (error) {
      this.logger.error(`Signed URL error: ${error.message}`);
      throw new Error(`Signed URL failed: ${error.message}`);
    }

    return data.signedUrl;
  }

  /**
   * Lists files in a bucket.
   *
   * @param {string} bucket - Bucket name
   * @param {string} folder - Folder path (optional)
   * @returns {Promise<any[]>} List of files
   */
  async listFiles(bucket: string, folder?: string): Promise<any[]> {
    if (!this.supabase) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .list(folder || '');

    if (error) {
      this.logger.error(`List files error: ${error.message}`);
      throw new Error(`List files failed: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Creates a new bucket.
   *
   * @param {string} name - Bucket name
   * @param {object} options - Bucket options
   * @returns {Promise<void>}
   */
  async createBucket(
    name: string,
    options?: {
      public?: boolean;
      fileSizeLimit?: number;
      allowedMimeTypes?: string[];
    },
  ): Promise<void> {
    if (!this.supabase) {
      throw new Error('Supabase not configured');
    }

    const { error } = await this.supabase.storage.createBucket(name, {
      public: options?.public || false,
      fileSizeLimit: options?.fileSizeLimit,
      allowedMimeTypes: options?.allowedMimeTypes,
    });

    if (error) {
      this.logger.error(`Create bucket error: ${error.message}`);
      throw new Error(`Create bucket failed: ${error.message}`);
    }

    this.logger.log(`Bucket created: ${name}`);
  }
}

