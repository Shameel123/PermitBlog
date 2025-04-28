import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PostService } from './post.service';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';
import { GetUser } from 'src/auth/get-user.decorator';
import { UserType } from 'src/users/types/user';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { ReviewPostDto } from './dto/review-post.dto';
import { AddCoAuthorDto } from './dto/add-co-author.dto';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async createPost(
    @Body() createPostDto: CreatePostDto,
    @GetUser() user: UserType,
  ) {
    return await this.postService.createPost(createPostDto, user);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getAllPosts(
    @GetUser() user: UserType,
    @Query('status') status?: string,
    @Query('tag') tag?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.postService.getAllPosts(user, status, tag, page, limit);
  }

  @Get('my-posts')
  @UseGuards(JwtAuthGuard)
  async getMyPosts(
    @GetUser() user: UserType,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.postService.getMyPosts(user, status, page, limit);
  }

  @Get('pending-review')
  @UseGuards(JwtAuthGuard)
  async getPendingReviewPosts(
    @GetUser() user: UserType,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return await this.postService.getPendingReviewPosts(user, page, limit);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async getPostById(@Param('id') id: string, @GetUser() user: UserType) {
    return await this.postService.getPostById(id, user);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Param('id') id: string,
    @Body() updatePostDto: UpdatePostDto,
    @GetUser() user: UserType,
  ) {
    return await this.postService.updatePost(id, updatePostDto, user);
  }

  @Patch(':id/submit-for-review')
  @UseGuards(JwtAuthGuard)
  async submitForReview(@Param('id') id: string, @GetUser() user: UserType) {
    return await this.postService.submitForReview(id, user);
  }

  @Patch(':id/review')
  @UseGuards(JwtAuthGuard)
  async reviewPost(
    @Param('id') id: string,
    @Body() reviewPostDto: ReviewPostDto,
    @GetUser() user: UserType,
  ) {
    return await this.postService.reviewPost(id, reviewPostDto, user);
  }

  @Patch(':id/publish')
  @UseGuards(JwtAuthGuard)
  async publishPost(@Param('id') id: string, @GetUser() user: UserType) {
    return await this.postService.publishPost(id, user);
  }

  @Patch(':id/archive')
  @UseGuards(JwtAuthGuard)
  async archivePost(@Param('id') id: string, @GetUser() user: UserType) {
    return await this.postService.archivePost(id, user);
  }

  @Post(':id/co-author')
  @UseGuards(JwtAuthGuard)
  async addCoAuthor(
    @Param('id') id: string,
    @Body() addCoAuthorDto: AddCoAuthorDto,
    @GetUser() user: UserType,
  ) {
    return await this.postService.addCoAuthor(id, addCoAuthorDto, user);
  }

  @Delete(':id/co-author/:authorId')
  @UseGuards(JwtAuthGuard)
  async removeCoAuthor(
    @Param('id') id: string,
    @Param('authorId') authorId: string,
    @GetUser() user: UserType,
  ) {
    return await this.postService.removeCoAuthor(id, authorId, user);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  async deletePost(@Param('id') id: string, @GetUser() user: UserType) {
    return await this.postService.deletePost(id, user);
  }
}
