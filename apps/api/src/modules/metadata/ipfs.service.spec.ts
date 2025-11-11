import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { IPFSService } from './ipfs.service';

describe('IPFSService', () => {
  let service: IPFSService;
  let configService: jest.Mocked<ConfigService>;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IPFSService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<IPFSService>(IPFSService);
    configService = module.get(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('pinFile', () => {
    it('should return null when provider is none', async () => {
      configService.get.mockReturnValue('none');

      const module = await Test.createTestingModule({
        providers: [
          IPFSService,
          {
            provide: ConfigService,
            useValue: configService,
          },
        ],
      }).compile();

      const ipfsService = module.get<IPFSService>(IPFSService);
      const buffer = Buffer.from('test');
      const result = await ipfsService.pinFile(buffer, 'test.png');

      expect(result).toBeNull();
    });

    it('should return null when provider is pinata but no credentials', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'IPFS_PROVIDER') return 'pinata';
        return undefined;
      });

      const module = await Test.createTestingModule({
        providers: [
          IPFSService,
          {
            provide: ConfigService,
            useValue: configService,
          },
        ],
      }).compile();

      const ipfsService = module.get<IPFSService>(IPFSService);
      const buffer = Buffer.from('test');
      const result = await ipfsService.pinFile(buffer, 'test.png');

      expect(result).toBeNull();
    });

    it('should return null when provider is web3storage but no API key', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'IPFS_PROVIDER') return 'web3storage';
        return undefined;
      });

      const module = await Test.createTestingModule({
        providers: [
          IPFSService,
          {
            provide: ConfigService,
            useValue: configService,
          },
        ],
      }).compile();

      const ipfsService = module.get<IPFSService>(IPFSService);
      const buffer = Buffer.from('test');
      const result = await ipfsService.pinFile(buffer, 'test.png');

      expect(result).toBeNull();
    });

    it('should return null when provider is infura but no credentials', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'IPFS_PROVIDER') return 'infura';
        return undefined;
      });

      const module = await Test.createTestingModule({
        providers: [
          IPFSService,
          {
            provide: ConfigService,
            useValue: configService,
          },
        ],
      }).compile();

      const ipfsService = module.get<IPFSService>(IPFSService);
      const buffer = Buffer.from('test');
      const result = await ipfsService.pinFile(buffer, 'test.png');

      expect(result).toBeNull();
    });

    it('should return null when provider is local', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'IPFS_PROVIDER') return 'local';
        return undefined;
      });

      const module = await Test.createTestingModule({
        providers: [
          IPFSService,
          {
            provide: ConfigService,
            useValue: configService,
          },
        ],
      }).compile();

      const ipfsService = module.get<IPFSService>(IPFSService);
      const buffer = Buffer.from('test');
      const result = await ipfsService.pinFile(buffer, 'test.png');

      expect(result).toBeNull();
    });

    it('should handle errors gracefully', async () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'IPFS_PROVIDER') return 'pinata';
        if (key === 'IPFS_API_KEY') return 'test-key';
        if (key === 'IPFS_API_SECRET') return 'test-secret';
        return undefined;
      });

      const module = await Test.createTestingModule({
        providers: [
          IPFSService,
          {
            provide: ConfigService,
            useValue: configService,
          },
        ],
      }).compile();

      const ipfsService = module.get<IPFSService>(IPFSService);
      const buffer = Buffer.from('test');
      const result = await ipfsService.pinFile(buffer, 'test.png');

      // Should return null on error, not throw
      expect(result).toBeNull();
    });
  });

  describe('getGatewayUrl', () => {
    it('should return gateway URL with default gateway', () => {
      configService.get.mockImplementation((key: string, defaultValue?: string) => {
        if (key === 'IPFS_GATEWAY') return defaultValue;
        return undefined;
      });

      const cid = 'QmTest123';
      const url = service.getGatewayUrl(cid);

      expect(url).toBe(`https://ipfs.io/ipfs/${cid}`);
    });

    it('should return gateway URL with custom gateway', () => {
      configService.get.mockImplementation((key: string) => {
        if (key === 'IPFS_GATEWAY') return 'https://custom-gateway.com/ipfs/';
        return undefined;
      });

      const cid = 'QmTest123';
      const url = service.getGatewayUrl(cid);

      expect(url).toBe(`https://custom-gateway.com/ipfs/${cid}`);
    });
  });
});

