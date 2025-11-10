import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Transaction {
  @Field()
  hash: string;

  @Field()
  from: string;

  @Field()
  to: string;

  @Field()
  value: string;

  @Field({ nullable: true })
  gas?: string;

  @Field({ nullable: true })
  gasPrice?: string;

  @Field({ nullable: true })
  blockNumber?: number;

  @Field({ nullable: true })
  blockHash?: string;

  @Field({ nullable: true })
  status?: string;
}
