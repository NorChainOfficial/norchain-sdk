import {
  Repository,
  FindOptionsWhere,
  FindManyOptions,
  ObjectLiteral,
} from 'typeorm';
import {
  PaginationOptions,
  PaginatedResult,
} from '../interfaces/pagination.interface';

export abstract class BaseRepository<T extends ObjectLiteral> {
  constructor(protected readonly repository: Repository<T>) {}

  async findAll(options?: FindManyOptions<T>): Promise<T[]> {
    return this.repository.find(options);
  }

  async findOne(id: any): Promise<T | null> {
    return this.repository.findOne({ where: { id } as FindOptionsWhere<T> });
  }

  async findBy(where: FindOptionsWhere<T>): Promise<T[]> {
    return this.repository.find({ where });
  }

  async findOneBy(where: FindOptionsWhere<T>): Promise<T | null> {
    return this.repository.findOne({ where });
  }

  async create(entity: Partial<T>): Promise<T> {
    const newEntity = this.repository.create(entity as any);
    const saved = await this.repository.save(newEntity);
    // TypeORM save can return T or T[], ensure we return T
    return Array.isArray(saved) ? saved[0] : (saved as T);
  }

  async update(id: any, entity: Partial<T>): Promise<T | null> {
    await this.repository.update(id, entity as any);
    return this.findOne(id);
  }

  async delete(id: any): Promise<void> {
    await this.repository.delete(id);
  }

  async count(where?: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({ where });
  }

  async paginate(
    options: PaginationOptions,
    where?: FindOptionsWhere<T>,
  ): Promise<PaginatedResult<T>> {
    const { page, limit, sortBy, sortOrder } = options;
    const skip = (page - 1) * limit;

    const [data, total] = await this.repository.findAndCount({
      where,
      take: limit,
      skip,
      order: sortBy ? ({ [sortBy]: sortOrder } as any) : undefined,
    });

    return {
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPreviousPage: page > 1,
      },
    };
  }
}
