import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PostStatus } from '../types/post-status.enum';

export class ReviewPostDto {
  @IsEnum([PostStatus.APPROVED, PostStatus.REJECTED])
  status: string;

  @IsString()
  @IsOptional()
  rejectedReason?: string;
}
