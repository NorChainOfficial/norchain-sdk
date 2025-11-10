import { ApiProperty } from '@nestjs/swagger';

export class ErrorDetailDto {
  @ApiProperty({ example: 'OFAC-XXXX', description: 'Specific error identifier' })
  list?: string;

  @ApiProperty({ example: true, description: 'Additional error context' })
  matched?: boolean;

  @ApiProperty({ example: 'field_name', description: 'Field that caused the error' })
  field?: string;

  @ApiProperty({ example: 'Invalid format', description: 'Field-specific error message' })
  message?: string;

  [key: string]: any;
}

export class ErrorResponseDto {
  @ApiProperty({
    example: 'COMPLIANCE_BLOCKED',
    description: 'Error code',
    enum: [
      'COMPLIANCE_BLOCKED',
      'RATE_LIMITED',
      'VALIDATION_FAILED',
      'UNAUTHORIZED',
      'FORBIDDEN',
      'NOT_FOUND',
      'BAD_REQUEST',
      'INTERNAL_ERROR',
      'SERVICE_UNAVAILABLE',
      'INSUFFICIENT_BALANCE',
      'INVALID_SIGNATURE',
      'TRANSACTION_FAILED',
      'BRIDGE_ERROR',
      'GOVERNANCE_ERROR',
    ],
  })
  code: string;

  @ApiProperty({
    example: 'Subject failed sanctions screening',
    description: 'Human-readable error message',
  })
  message: string;

  @ApiProperty({
    example: '01HX8ABCDEF123456',
    description: 'Trace ID for debugging',
  })
  trace_id: string;

  @ApiProperty({
    type: ErrorDetailDto,
    description: 'Additional error details',
    required: false,
  })
  details?: ErrorDetailDto;

  @ApiProperty({
    example: '2025-01-10T12:00:00Z',
    description: 'Timestamp of the error',
  })
  timestamp: string;
}

