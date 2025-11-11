import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BaseRepository } from './base.repository';

interface TestEntity {
  id: string;
  name: string;
  value: number;
}

describe('BaseRepository', () => {
  let repository: BaseRepository<TestEntity>;
  let typeOrmRepository: Repository<TestEntity>;

  const mockEntity: TestEntity = {
    id: '1',
    name: 'Test',
    value: 100,
  };

  const mockTypeOrmRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: getRepositoryToken(Object),
          useValue: mockTypeOrmRepository,
        },
      ],
    }).compile();

    typeOrmRepository = module.get(getRepositoryToken(Object));
    repository = new (class extends BaseRepository<TestEntity> {
      constructor() {
        super(typeOrmRepository);
      }
    })();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(repository).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all entities', async () => {
      const entities = [mockEntity];
      mockTypeOrmRepository.find.mockResolvedValue(entities);

      const result = await repository.findAll();

      expect(result).toEqual(entities);
      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith(undefined);
    });

    it('should pass options to find', async () => {
      const options = { where: { name: 'Test' } };
      mockTypeOrmRepository.find.mockResolvedValue([]);

      await repository.findAll(options);

      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith(options);
    });
  });

  describe('findOne', () => {
    it('should return entity by id', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(mockEntity);

      const result = await repository.findOne('1');

      expect(result).toEqual(mockEntity);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if not found', async () => {
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.findOne('999');

      expect(result).toBeNull();
    });
  });

  describe('findBy', () => {
    it('should return entities matching where clause', async () => {
      const where = { name: 'Test' };
      const entities = [mockEntity];
      mockTypeOrmRepository.find.mockResolvedValue(entities);

      const result = await repository.findBy(where);

      expect(result).toEqual(entities);
      expect(mockTypeOrmRepository.find).toHaveBeenCalledWith({ where });
    });
  });

  describe('findOneBy', () => {
    it('should return single entity matching where clause', async () => {
      const where = { name: 'Test' };
      mockTypeOrmRepository.findOne.mockResolvedValue(mockEntity);

      const result = await repository.findOneBy(where);

      expect(result).toEqual(mockEntity);
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({ where });
    });
  });

  describe('create', () => {
    it('should create and save entity', async () => {
      const partial = { name: 'New', value: 200 };
      mockTypeOrmRepository.create.mockReturnValue(mockEntity);
      mockTypeOrmRepository.save.mockResolvedValue(mockEntity);

      const result = await repository.create(partial);

      expect(result).toEqual(mockEntity);
      expect(mockTypeOrmRepository.create).toHaveBeenCalledWith(partial);
      expect(mockTypeOrmRepository.save).toHaveBeenCalled();
    });

    it('should handle array return from save', async () => {
      mockTypeOrmRepository.create.mockReturnValue(mockEntity);
      mockTypeOrmRepository.save.mockResolvedValue([mockEntity]);

      const result = await repository.create({ name: 'Test' });

      expect(result).toEqual(mockEntity);
    });
  });

  describe('update', () => {
    it('should update entity and return updated', async () => {
      const updated = { ...mockEntity, name: 'Updated' };
      mockTypeOrmRepository.update.mockResolvedValue({ affected: 1 });
      mockTypeOrmRepository.findOne.mockResolvedValue(updated);

      const result = await repository.update('1', { name: 'Updated' });

      expect(result).toEqual(updated);
      expect(mockTypeOrmRepository.update).toHaveBeenCalledWith('1', {
        name: 'Updated',
      });
      expect(mockTypeOrmRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if entity not found after update', async () => {
      mockTypeOrmRepository.update.mockResolvedValue({ affected: 0 });
      mockTypeOrmRepository.findOne.mockResolvedValue(null);

      const result = await repository.update('999', { name: 'Updated' });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete entity', async () => {
      mockTypeOrmRepository.delete.mockResolvedValue({ affected: 1 });

      await repository.delete('1');

      expect(mockTypeOrmRepository.delete).toHaveBeenCalledWith('1');
    });
  });

  describe('count', () => {
    it('should return count of entities', async () => {
      mockTypeOrmRepository.count.mockResolvedValue(10);

      const result = await repository.count();

      expect(result).toBe(10);
      expect(mockTypeOrmRepository.count).toHaveBeenCalledWith({ where: undefined });
    });

    it('should return count with where clause', async () => {
      const where = { name: 'Test' };
      mockTypeOrmRepository.count.mockResolvedValue(5);

      const result = await repository.count(where);

      expect(result).toBe(5);
      expect(mockTypeOrmRepository.count).toHaveBeenCalledWith({ where });
    });
  });

  describe('paginate', () => {
    it('should return paginated results', async () => {
      const entities = [mockEntity];
      mockTypeOrmRepository.findAndCount.mockResolvedValue([entities, 100]);

      const result = await repository.paginate({
        page: 1,
        limit: 10,
      });

      expect(result.data).toEqual(entities);
      expect(result.meta.total).toBe(100);
      expect(result.meta.page).toBe(1);
      expect(result.meta.limit).toBe(10);
      expect(result.meta.totalPages).toBe(10);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(false);
    });

    it('should calculate pagination correctly', async () => {
      mockTypeOrmRepository.findAndCount.mockResolvedValue([[], 25]);

      const result = await repository.paginate({
        page: 2,
        limit: 10,
      });

      expect(result.meta.totalPages).toBe(3);
      expect(result.meta.hasNextPage).toBe(true);
      expect(result.meta.hasPreviousPage).toBe(true);
      expect(mockTypeOrmRepository.findAndCount).toHaveBeenCalledWith({
        where: undefined,
        take: 10,
        skip: 10,
        order: undefined,
      });
    });

    it('should handle sorting', async () => {
      mockTypeOrmRepository.findAndCount.mockResolvedValue([[], 0]);

      await repository.paginate({
        page: 1,
        limit: 10,
        sortBy: 'name',
        sortOrder: 'DESC',
      });

      expect(mockTypeOrmRepository.findAndCount).toHaveBeenCalledWith({
        where: undefined,
        take: 10,
        skip: 0,
        order: { name: 'DESC' },
      });
    });

    it('should handle where clause', async () => {
      const where = { name: 'Test' };
      mockTypeOrmRepository.findAndCount.mockResolvedValue([[], 0]);

      await repository.paginate(
        {
          page: 1,
          limit: 10,
        },
        where,
      );

      expect(mockTypeOrmRepository.findAndCount).toHaveBeenCalledWith({
        where,
        take: 10,
        skip: 0,
        order: undefined,
      });
    });
  });
});

