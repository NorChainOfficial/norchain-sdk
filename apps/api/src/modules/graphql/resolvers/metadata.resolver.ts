import { Resolver, Query, Args } from '@nestjs/graphql';
import { MetadataService } from '../../metadata/metadata.service';
import { AssetProfile } from '../types/asset-profile.type';

@Resolver(() => AssetProfile)
export class MetadataResolver {
  constructor(private readonly metadataService: MetadataService) {}

  @Query(() => AssetProfile, { nullable: true })
  async assetProfile(
    @Args('chainId') chainId: string,
    @Args('address') address: string,
  ) {
    return this.metadataService.getProfile(chainId, address);
  }

  @Query(() => [AssetProfile])
  async searchProfiles(
    @Args('query', { nullable: true }) query?: string,
    @Args('tags', { type: () => [String], nullable: true }) tags?: string[],
    @Args('limit', { defaultValue: 10 }) limit?: number,
    @Args('offset', { defaultValue: 0 }) offset?: number,
  ) {
    // MetadataService.searchProfiles expects tag (singular) not tags (array)
    // For now, use first tag if provided
    const tag = tags && tags.length > 0 ? tags[0] : undefined;
    return this.metadataService.searchProfiles(
      query,
      tag,
      undefined,
      limit,
      offset,
    );
  }
}
