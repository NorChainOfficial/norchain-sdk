import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsUUID, MaxLength } from 'class-validator';

export class ClosePeriodDto {
  @ApiProperty({
    example: 'org_123',
    description: 'Organization ID',
  })
  @IsUUID()
  orgId: string;

  @ApiProperty({
    example: '2025-01',
    description: 'Accounting period to close (YYYY-MM)',
  })
  @IsString()
  @MaxLength(20)
  period: string;
}

