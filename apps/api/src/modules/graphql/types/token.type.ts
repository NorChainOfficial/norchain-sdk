import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Token {
  @Field()
  address: string;

  @Field()
  name: string;

  @Field()
  symbol: string;

  @Field()
  decimals: number;

  @Field()
  totalSupply: string;
}
