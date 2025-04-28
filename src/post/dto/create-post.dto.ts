import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';
import { PostStatus } from '../types/post-status.enum';

export class CreatePostDto {
  @IsString()
  @Length(5, 100)
  title: string;

  @IsString()
  @Length(10, 50000)
  content: string;

  @IsEnum(PostStatus)
  @IsOptional()
  status?: string = PostStatus.DRAFT;

  @IsArray()
  @IsOptional()
  authors?: string[] = []; // Additional authors (co-authors)

  @IsArray()
  @IsOptional()
  tags?: string[] = [];

  @IsString()
  @IsOptional()
  coverImage?: string;

  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean = false;
}
