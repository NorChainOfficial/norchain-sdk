import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiConsumes,
} from '@nestjs/swagger';
import { MetadataService } from './metadata.service';
import { MetadataStorageService } from './metadata-storage.service';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { SubmitProfileDto } from './dto/submit-profile.dto';
import { UploadMediaDto, MediaKind } from './dto/upload-media.dto';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { Idempotent } from '@/common/decorators/idempotency.decorator';
import { TrustLevel } from './entities/asset-profile.entity';
import { ErrorResponseDto } from '@/common/dto/error-response.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

@ApiTags('Metadata')
@Controller('v2/metadata')
export class MetadataController {
  constructor(
    private readonly metadataService: MetadataService,
    private readonly storageService: MetadataStorageService,
  ) {}

  @Post('challenges')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create ownership challenge for signing' })
  @ApiResponse({
    status: 201,
    description: 'Challenge created successfully',
    schema: {
      type: 'object',
      properties: {
        challengeId: { type: 'string' },
        message: { type: 'string' },
        expiresAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  async createChallenge(@Request() req: any, @Body() dto: CreateChallengeDto) {
    return this.metadataService.createChallenge(req.user.id, dto);
  }

  @Post('profiles')
  @Idempotent()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit or update an asset profile' })
  @ApiResponse({
    status: 201,
    description: 'Profile created/updated successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Invalid signature or not owner',
    type: ErrorResponseDto,
  })
  async submitProfile(@Request() req: any, @Body() dto: SubmitProfileDto) {
    return this.metadataService.submitProfile(req.user.id, dto);
  }

  @Get('profiles/:chainId/:address')
  @ApiOperation({ summary: 'Get asset profile by chain ID and address' })
  @ApiParam({ name: 'chainId', description: 'Chain ID' })
  @ApiParam({ name: 'address', description: 'Token or contract address' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Profile not found',
    type: ErrorResponseDto,
  })
  async getProfile(
    @Param('chainId') chainId: string,
    @Param('address') address: string,
  ) {
    const profile = await this.metadataService.getProfile(chainId, address);
    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    return profile;
  }

  @Get('profiles/:chainId/:address/versions')
  @ApiOperation({ summary: 'Get profile version history' })
  @ApiParam({ name: 'chainId', description: 'Chain ID' })
  @ApiParam({ name: 'address', description: 'Token or contract address' })
  @ApiResponse({
    status: 200,
    description: 'Versions retrieved successfully',
  })
  async getProfileVersions(
    @Param('chainId') chainId: string,
    @Param('address') address: string,
  ) {
    return this.metadataService.getProfileVersions(chainId, address);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search asset profiles' })
  @ApiQuery({ name: 'query', required: false, description: 'Search query' })
  @ApiQuery({ name: 'tag', required: false, description: 'Filter by tag' })
  @ApiQuery({
    name: 'trustLevel',
    required: false,
    enum: TrustLevel,
    description: 'Filter by trust level',
  })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Search results',
  })
  async searchProfiles(
    @Query('query') query?: string,
    @Query('tag') tag?: string,
    @Query('trustLevel') trustLevel?: TrustLevel,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ) {
    return this.metadataService.searchProfiles(
      query,
      tag,
      trustLevel,
      limit,
      offset,
    );
  }

  @Post('attest')
  @Idempotent()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Add community attestation to profile' })
  @ApiResponse({
    status: 201,
    description: 'Attestation added successfully',
  })
  async addAttestation(
    @Request() req: any,
    @Body()
    dto: {
      profileId: string;
      signerAddress: string;
      signature: string;
      rationale?: string;
    },
  ) {
    return this.metadataService.addAttestation(
      dto.profileId,
      dto.signerAddress,
      dto.signature,
      dto.rationale,
    );
  }

  @Post('report')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Report profile for abuse/phishing' })
  @ApiResponse({
    status: 201,
    description: 'Report submitted successfully',
  })
  async reportProfile(
    @Request() req: any,
    @Body() dto: { profileId: string; reason: string },
  ) {
    return this.metadataService.reportProfile(
      dto.profileId,
      req.user.id,
      dto.reason,
    );
  }

  @Post('media')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Upload logo or banner (returns CDN URLs)',
    description:
      'Uploads media file and returns CDN URL. In production, would integrate with Supabase Storage and IPFS.',
  })
  @ApiResponse({
    status: 201,
    description: 'Media uploaded successfully',
    schema: {
      type: 'object',
      properties: {
        url: { type: 'string', format: 'uri' },
        ipfsCid: { type: 'string' },
      },
    },
  })
  async uploadMedia(
    @Request() req: any,
    @Body() dto: UploadMediaDto,
    @UploadedFile() file: any,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    return this.storageService.uploadMedia(file, dto.kind, req.user.id);
  }
}
