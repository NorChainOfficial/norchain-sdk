import { Test, TestingModule } from '@nestjs/testing';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { ResponseDto } from '@/common/interfaces/api-response.interface';

describe('TransactionController', () => {
  let controller: TransactionController;
  let service: jest.Mocked<TransactionService>;

  beforeEach(async () => {
    const mockTransactionService = {
      getTransaction: jest.fn(),
      getTxReceiptStatus: jest.fn(),
      getStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TransactionController],
      providers: [
        {
          provide: TransactionService,
          useValue: mockTransactionService,
        },
      ],
    }).compile();

    controller = module.get<TransactionController>(TransactionController);
    service = module.get(TransactionService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getTransaction', () => {
    it('should return transaction by hash', async () => {
      const txHash = '0x123';
      const mockResponse = ResponseDto.success({
        blockNumber: '12345',
        timeStamp: '1234567890',
        hash: txHash,
        nonce: '0',
        blockHash: '0xabc',
        transactionIndex: '0',
        from: '0xfrom',
        to: '0xto',
        value: '1000000000000000000',
        gas: '21000',
        gasPrice: '20000000000',
        gasUsed: '21000',
        isError: '0',
        txreceipt_status: '1',
        input: '0x',
        contractAddress: '',
        cumulativeGasUsed: '0',
        confirmations: '0',
      });
      service.getTransaction.mockResolvedValue(mockResponse);

      const result = await controller.getTransaction(txHash);

      expect(result).toEqual(mockResponse);
      expect(service.getTransaction).toHaveBeenCalledWith(txHash);
    });
  });

  describe('getTxReceiptStatus', () => {
    it('should return transaction receipt status', async () => {
      const txHash = '0x123';
      const mockResponse = ResponseDto.success({ status: '1', message: 'Pass' });
      service.getTxReceiptStatus.mockResolvedValue(mockResponse);

      const result = await controller.getTxReceiptStatus(txHash);

      expect(result).toEqual(mockResponse);
      expect(service.getTxReceiptStatus).toHaveBeenCalledWith(txHash);
    });
  });

  describe('getStatus', () => {
    it('should return transaction status', async () => {
      const txHash = '0x123';
      const mockResponse = ResponseDto.success({
        isError: '0',
        errDescription: '',
        status: 'confirmed',
      });
      service.getStatus.mockResolvedValue(mockResponse);

      const result = await controller.getStatus(txHash);

      expect(result).toEqual(mockResponse);
      expect(service.getStatus).toHaveBeenCalledWith(txHash);
    });
  });
});

