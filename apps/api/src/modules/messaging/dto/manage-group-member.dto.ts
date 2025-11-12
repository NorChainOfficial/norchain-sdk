import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum GroupMemberRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  MEMBER = 'member',
}

export class ManageGroupMemberDto {
  @ApiProperty({
    description: 'DID of the member to add/update',
  })
  @IsString()
  memberDid: string;

  @ApiPropertyOptional({
    description: 'Role for the member (admin, moderator, member)',
    enum: GroupMemberRole,
    default: GroupMemberRole.MEMBER,
  })
  @IsOptional()
  @IsEnum(GroupMemberRole)
  role?: GroupMemberRole;
}
