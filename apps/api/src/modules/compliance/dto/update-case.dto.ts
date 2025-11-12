import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { CaseStatus, CaseSeverity } from '../entities/compliance-case.entity';

export class UpdateCaseDto {
  @ApiPropertyOptional({
    description: 'Case status',
    enum: CaseStatus,
  })
  @IsOptional()
  @IsEnum(CaseStatus)
  status?: CaseStatus;

  @ApiPropertyOptional({
    description: 'Case severity',
    enum: CaseSeverity,
  })
  @IsOptional()
  @IsEnum(CaseSeverity)
  severity?: CaseSeverity;

  @ApiPropertyOptional({
    description: 'Case notes/comments',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Assigned to user ID',
  })
  @IsOptional()
  @IsString()
  assignedTo?: string;
}
