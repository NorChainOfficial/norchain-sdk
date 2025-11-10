import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class AssetProfile {
  @Field()
  id: string;

  @Field()
  type: string;

  @Field()
  chainId: string;

  @Field({ nullable: true })
  address?: string;

  @Field({ nullable: true })
  displayName?: string;

  @Field({ nullable: true })
  symbol?: string;

  @Field({ nullable: true })
  logoUrl?: string;

  @Field({ nullable: true })
  website?: string;

  @Field()
  trustLevel: string;
}

