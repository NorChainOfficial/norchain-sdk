import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseStorageService } from './supabase-storage.service';
import { SupabaseService } from './supabase.service';

describe('SupabaseStorageService', () => {
  let service: SupabaseStorageService;
  let supabaseService: jest.Mocked<SupabaseService>;
  let mockSupabaseClient: any;

  beforeEach(async () => {
    mockSupabaseClient = {
      storage: {
        from: jest.fn().mockReturnThis(),
        upload: jest.fn(),
        download: jest.fn(),
        remove: jest.fn(),
        getPublicUrl: jest.fn(),
        createSignedUrl: jest.fn(),
        list: jest.fn(),
        createBucket: jest.fn(),
      },
    };

    const mockSupabaseService = {
      getClient: jest.fn().mockReturnValue(mockSupabaseClient),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SupabaseStorageService,
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<SupabaseStorageService>(SupabaseStorageService);
    supabaseService = module.get(SupabaseService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload', () => {
    it('should upload file successfully', async () => {
      const fileBuffer = Buffer.from('test file content');
      const mockUploadResult = { path: 'user-123.jpg' };

      mockSupabaseClient.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: mockUploadResult,
          error: null,
        }),
      });

      const result = await service.upload(
        'avatars',
        'user-123.jpg',
        fileBuffer,
        { contentType: 'image/jpeg' },
      );

      expect(result).toEqual({ path: 'user-123.jpg' });
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('avatars');
    });

    it('should upload file with metadata', async () => {
      const fileBuffer = Buffer.from('test file content');
      const mockUploadResult = { path: 'document.pdf' };

      mockSupabaseClient.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: mockUploadResult,
          error: null,
        }),
      });

      const result = await service.upload(
        'documents',
        'document.pdf',
        fileBuffer,
        {
          contentType: 'application/pdf',
          metadata: { author: 'John Doe' },
        },
      );

      expect(result).toEqual({ path: 'document.pdf' });
    });

    it('should throw error on upload failure', async () => {
      const fileBuffer = Buffer.from('test file content');

      mockSupabaseClient.storage.from.mockReturnValue({
        upload: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Upload failed' },
        }),
      });

      await expect(
        service.upload('avatars', 'user-123.jpg', fileBuffer),
      ).rejects.toThrow('Upload failed: Upload failed');
    });

    it('should throw error if Supabase not configured', async () => {
      (service as any).supabase = null;

      await expect(
        service.upload('avatars', 'user-123.jpg', Buffer.from('test')),
      ).rejects.toThrow('Supabase not configured');
    });
  });

  describe('download', () => {
    it('should download file successfully', async () => {
      const mockBlob = new Blob(['file content']);

      mockSupabaseClient.storage.from.mockReturnValue({
        download: jest.fn().mockResolvedValue({
          data: mockBlob,
          error: null,
        }),
      });

      const result = await service.download('avatars', 'user-123.jpg');

      expect(result).toEqual(mockBlob);
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('avatars');
    });

    it('should throw error on download failure', async () => {
      mockSupabaseClient.storage.from.mockReturnValue({
        download: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'File not found' },
        }),
      });

      await expect(
        service.download('avatars', 'nonexistent.jpg'),
      ).rejects.toThrow('Download failed: File not found');
    });
  });

  describe('delete', () => {
    it('should delete file successfully', async () => {
      mockSupabaseClient.storage.from.mockReturnValue({
        remove: jest.fn().mockResolvedValue({
          error: null,
        }),
      });

      await service.delete('avatars', 'user-123.jpg');

      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('avatars');
    });

    it('should throw error on delete failure', async () => {
      mockSupabaseClient.storage.from.mockReturnValue({
        remove: jest.fn().mockResolvedValue({
          error: { message: 'Delete failed' },
        }),
      });

      await expect(
        service.delete('avatars', 'user-123.jpg'),
      ).rejects.toThrow('Delete failed: Delete failed');
    });
  });

  describe('getPublicUrl', () => {
    it('should return public URL', () => {
      const mockUrl = 'https://supabase.co/storage/v1/object/public/avatars/user-123.jpg';

      mockSupabaseClient.storage.from.mockReturnValue({
        getPublicUrl: jest.fn().mockReturnValue({
          data: { publicUrl: mockUrl },
        }),
      });

      const result = service.getPublicUrl('avatars', 'user-123.jpg');

      expect(result).toBe(mockUrl);
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('avatars');
    });

    it('should throw error if Supabase not configured', () => {
      (service as any).supabase = null;

      expect(() => {
        service.getPublicUrl('avatars', 'user-123.jpg');
      }).toThrow('Supabase not configured');
    });
  });

  describe('getSignedUrl', () => {
    it('should return signed URL', async () => {
      const mockSignedUrl =
        'https://supabase.co/storage/v1/object/sign/private/document.pdf?token=abc123';

      mockSupabaseClient.storage.from.mockReturnValue({
        createSignedUrl: jest.fn().mockResolvedValue({
          data: { signedUrl: mockSignedUrl },
          error: null,
        }),
      });

      const result = await service.getSignedUrl(
        'private-files',
        'document.pdf',
        3600,
      );

      expect(result).toBe(mockSignedUrl);
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith(
        'private-files',
      );
    });

    it('should use default expiration time', async () => {
      const mockSignedUrl = 'https://supabase.co/storage/v1/object/sign/private/document.pdf?token=abc123';

      mockSupabaseClient.storage.from.mockReturnValue({
        createSignedUrl: jest.fn().mockResolvedValue({
          data: { signedUrl: mockSignedUrl },
          error: null,
        }),
      });

      const result = await service.getSignedUrl('private-files', 'document.pdf');

      expect(result).toBe(mockSignedUrl);
    });

    it('should throw error on failure', async () => {
      mockSupabaseClient.storage.from.mockReturnValue({
        createSignedUrl: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'Failed to create signed URL' },
        }),
      });

      await expect(
        service.getSignedUrl('private-files', 'document.pdf'),
      ).rejects.toThrow('Signed URL failed: Failed to create signed URL');
    });
  });

  describe('listFiles', () => {
    it('should list files successfully', async () => {
      const mockFiles = [
        { name: 'file1.jpg', size: 1024 },
        { name: 'file2.jpg', size: 2048 },
      ];

      mockSupabaseClient.storage.from.mockReturnValue({
        list: jest.fn().mockResolvedValue({
          data: mockFiles,
          error: null,
        }),
      });

      const result = await service.listFiles('avatars');

      expect(result).toEqual(mockFiles);
      expect(mockSupabaseClient.storage.from).toHaveBeenCalledWith('avatars');
    });

    it('should list files in folder', async () => {
      const mockFiles = [{ name: 'subfolder/file.jpg', size: 1024 }];

      mockSupabaseClient.storage.from.mockReturnValue({
        list: jest.fn().mockResolvedValue({
          data: mockFiles,
          error: null,
        }),
      });

      const result = await service.listFiles('avatars', 'subfolder');

      expect(result).toEqual(mockFiles);
    });

    it('should return empty array if no files', async () => {
      mockSupabaseClient.storage.from.mockReturnValue({
        list: jest.fn().mockResolvedValue({
          data: [],
          error: null,
        }),
      });

      const result = await service.listFiles('avatars');

      expect(result).toEqual([]);
    });

    it('should throw error on failure', async () => {
      mockSupabaseClient.storage.from.mockReturnValue({
        list: jest.fn().mockResolvedValue({
          data: null,
          error: { message: 'List failed' },
        }),
      });

      await expect(service.listFiles('avatars')).rejects.toThrow(
        'List files failed: List failed',
      );
    });
  });

  describe('createBucket', () => {
    it('should create bucket successfully', async () => {
      mockSupabaseClient.storage.createBucket.mockResolvedValue({
        error: null,
      });

      await service.createBucket('new-bucket', { public: true });

      expect(mockSupabaseClient.storage.createBucket).toHaveBeenCalledWith(
        'new-bucket',
        {
          public: true,
          fileSizeLimit: undefined,
          allowedMimeTypes: undefined,
        },
      );
    });

    it('should create private bucket by default', async () => {
      mockSupabaseClient.storage.createBucket.mockResolvedValue({
        error: null,
      });

      await service.createBucket('private-bucket');

      expect(mockSupabaseClient.storage.createBucket).toHaveBeenCalledWith(
        'private-bucket',
        {
          public: false,
          fileSizeLimit: undefined,
          allowedMimeTypes: undefined,
        },
      );
    });

    it('should create bucket with size limit and mime types', async () => {
      mockSupabaseClient.storage.createBucket.mockResolvedValue({
        error: null,
      });

      await service.createBucket('restricted-bucket', {
        public: false,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png'],
      });

      expect(mockSupabaseClient.storage.createBucket).toHaveBeenCalledWith(
        'restricted-bucket',
        {
          public: false,
          fileSizeLimit: 5242880,
          allowedMimeTypes: ['image/jpeg', 'image/png'],
        },
      );
    });

    it('should throw error on failure', async () => {
      mockSupabaseClient.storage.createBucket.mockResolvedValue({
        error: { message: 'Bucket already exists' },
      });

      await expect(
        service.createBucket('existing-bucket'),
      ).rejects.toThrow('Create bucket failed: Bucket already exists');
    });
  });
});

