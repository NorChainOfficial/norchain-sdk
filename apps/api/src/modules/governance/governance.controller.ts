import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { GovernanceService } from './governance.service';
import { JwtAuthGuard } from '@/common/guards/jwt-auth.guard';
import { CreateProposalDto } from './dto/create-proposal.dto';
import { CreateVoteDto } from './dto/create-vote.dto';
import { ProposalStatus } from './entities/governance-proposal.entity';

@ApiTags('Governance')
@Controller('governance')
export class GovernanceController {
  constructor(private readonly governanceService: GovernanceService) {}

  @Get('proposals')
  @ApiOperation({ summary: 'Get all governance proposals' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'offset', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, enum: ProposalStatus })
  @ApiResponse({
    status: 200,
    description: 'Proposals retrieved successfully',
  })
  async getProposals(
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('status') status?: ProposalStatus,
  ) {
    return this.governanceService.getProposals(limit, offset, status);
  }

  @Get('proposals/:id')
  @ApiOperation({ summary: 'Get proposal details' })
  @ApiParam({ name: 'id', description: 'Proposal ID' })
  @ApiResponse({
    status: 200,
    description: 'Proposal details retrieved successfully',
  })
  async getProposal(@Param('id') proposalId: string) {
    return this.governanceService.getProposal(proposalId);
  }

  @Post('proposals')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Create a governance proposal' })
  @ApiResponse({
    status: 201,
    description: 'Proposal created successfully',
  })
  async createProposal(
    @Request() req: any,
    @Body() dto: CreateProposalDto,
    @Query('proposer') proposerAddress: string,
  ) {
    // In production, proposerAddress would come from authenticated user's wallet
    return this.governanceService.createProposal(req.user.id, proposerAddress || req.user.id, dto);
  }

  @Post('proposals/:id/votes')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Submit a vote on a proposal' })
  @ApiParam({ name: 'id', description: 'Proposal ID' })
  @ApiResponse({
    status: 201,
    description: 'Vote submitted successfully',
  })
  async submitVote(
    @Request() req: any,
    @Param('id') proposalId: string,
    @Body() dto: CreateVoteDto,
    @Query('voter') voterAddress: string,
  ) {
    return this.governanceService.submitVote(
      req.user.id,
      voterAddress || req.user.id,
      proposalId,
      dto,
    );
  }

  @Get('proposals/:id/tally')
  @ApiOperation({ summary: 'Get vote tally for a proposal' })
  @ApiParam({ name: 'id', description: 'Proposal ID' })
  @ApiResponse({
    status: 200,
    description: 'Tally retrieved successfully',
  })
  async getTally(@Param('id') proposalId: string) {
    return this.governanceService.getTally(proposalId);
  }

  @Get('params')
  @ApiOperation({ summary: 'Get governance parameters' })
  @ApiResponse({
    status: 200,
    description: 'Parameters retrieved successfully',
  })
  async getParameters() {
    return this.governanceService.getParameters();
  }
}

