import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnalyzeTransactionDto {
  @ApiProperty({ description: 'Transaction hash to analyze' })
  @IsString()
  @IsNotEmpty()
  txHash: string;
}
