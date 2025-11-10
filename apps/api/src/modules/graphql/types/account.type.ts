import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class Account {
  @Field()
  address: string;

  @Field()
  balance: string;

  @Field({ nullable: true })
  nonce?: number;

  @Field({ nullable: true })
  codeHash?: string;
}
