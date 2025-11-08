import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MinLength } from 'class-validator';

/**
 * DTO for broadcasting a signed transaction
 */
export class BroadcastTransactionDto {
  @ApiProperty({
    description: 'Signed transaction hex string (0x-prefixed)',
    example: '0xf86c808502540be400825208943535353535353535353535353535353535353535880de0b6b3a76400008025a028ef61340bd939bc2195fe537567866003e1a15d3c71ff63e1590620aa636276a067cbe9d8997f761aecb703304b24e8ddbdc05c6dff2790f53122fd4a99d7c1c0',
  })
  @IsString()
  @Matches(/^0x[a-fA-F0-9]+$/, {
    message: 'Transaction must be a valid hex string starting with 0x',
  })
  @MinLength(10)
  signedTransaction: string;
}

