import { Test, TestingModule } from '@nestjs/testing';
import { ConsensusService } from './consensus.service';

describe('ConsensusService', () => {
  let service: ConsensusService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConsensusService],
    }).compile();

    service = module.get<ConsensusService>(ConsensusService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getInfo', () => {
    it('should return consensus information', async () => {
      const result = await service.getInfo();

      expect(result).toHaveProperty('consensus');
      expect(result).toHaveProperty('blockTime');
      expect(result).toHaveProperty('finality');
      expect(result.consensus).toBe('PoSA');
      expect(result.blockTime).toBe(3);
      expect(result.finality).toBe('1 block');
    });
  });
});

