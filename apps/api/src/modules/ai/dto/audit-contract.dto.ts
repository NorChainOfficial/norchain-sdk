import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuditContractDto {
  @ApiProperty({ description: 'Contract address to audit' })
  @IsString()
  @IsNotEmpty()
  contractAddress: string;
}
