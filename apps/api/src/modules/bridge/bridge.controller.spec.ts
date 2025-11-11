import { Test, TestingModule } from '@nestjs/testing';
import { BridgeController } from './bridge.controller';
import { BridgeService } from './bridge.service';
import { CreateBridgeQuoteDto } from './dto/create-bridge-quote.dto';
import { CreateBridgeTransferDto } from './dto/create-bridge-transfer.dto';
import { BridgeChain } from './entities/bridge-transfer.entity';

describe('BridgeController', () => {
  let controller: BridgeController;
  let bridgeService: BridgeService;

  const mockBridgeService = {
    getQuote: jest.fn(),
    createTransfer: jest.fn(),
    getTransfer: jest.fn(),
    getUserTransfers: jest.fn(),
    getTransferProof: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BridgeController],
      providers: [
        {
          provide: BridgeService,
          useValue: mockBridgeService,
        },
      ],
    }).compile();

    controller = module.get<BridgeController>(BridgeController);
    bridgeService = module.get<BridgeService>(BridgeService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getQuote', () => {
    it('should return a bridge quote', async () => {
      const dto: CreateBridgeQuoteDto = {
        srcChain: BridgeChain.NOR,
        dstChain: BridgeChain.BSC,
        amount: '1000000000000000000',
        asset: 'NOR',
      };

      const mockQuote = {
        srcChain: BridgeChain.NOR,
        dstChain: BridgeChain.BSC,
        amount: dto.amount,
        fees: '500000000000000',
        amountAfterFees: '950000000000000000',
        estimatedTime: 300,
      };

      mockBridgeService.getQuote.mockResolvedValue(mockQuote);

      const result = await controller.getQuote(dto);

      expect(result).toEqual(mockQuote);
      expect(mockBridgeService.getQuote).toHaveBeenCalledWith(dto);
    });
  });

  describe('createTransfer', () => {
    it('should create a bridge transfer', async () => {
      const dto: CreateBridgeTransferDto = {
        srcChain: BridgeChain.NOR,
        dstChain: BridgeChain.BSC,
        amount: '1000000000000000000',
        asset: 'NOR',
        toAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb0',
      };

      const mockTransfer = {
        transferId: 'transfer-123',
        status: 'pending',
      };

      mockBridgeService.createTransfer.mockResolvedValue(mockTransfer);

      const result = await controller.createTransfer(
        { user: { id: 'user-123' } },
        dto,
      );

      expect(result).toEqual(mockTransfer);
      expect(mockBridgeService.createTransfer).toHaveBeenCalledWith(
        'user-123',
        dto,
      );
    });
  });

  describe('getTransfer', () => {
    it('should return transfer details', async () => {
      const transferId = 'transfer-123';
      const mockTransfer = {
        transferId,
        status: 'pending',
      };

      mockBridgeService.getTransfer.mockResolvedValue(mockTransfer);

      const result = await controller.getTransfer(
        { user: { id: 'user-123' } },
        transferId,
      );

      expect(result).toEqual(mockTransfer);
      expect(mockBridgeService.getTransfer).toHaveBeenCalledWith(
        'user-123',
        transferId,
      );
    });
  });

  describe('getTransfers', () => {
    it('should return paginated transfers', async () => {
      const mockResult = {
        transfers: [{ transfer_id: 'transfer-1' }],
        total: 1,
      };

      mockBridgeService.getUserTransfers.mockResolvedValue(mockResult);

      const result = await controller.getTransfers(
        { user: { id: 'user-123' } },
        50,
        0,
      );

      expect(result).toEqual(mockResult);
      expect(mockBridgeService.getUserTransfers).toHaveBeenCalledWith(
        'user-123',
        50,
        0,
      );
    });
  });
});

