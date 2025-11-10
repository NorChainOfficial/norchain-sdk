import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Transaction } from './transaction.type';

@ObjectType()
export class Block {
  @Field()
  hash: string;

  @Field(() => Int)
  number: number;

  @Field()
  parentHash: string;

  @Field()
  timestamp: string;

  @Field(() => [Transaction], { nullable: true })
  transactions?: Transaction[];

  @Field()
  gasUsed: string;

  @Field()
  gasLimit: string;
}

