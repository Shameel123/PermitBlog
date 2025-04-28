/* eslint-disable @typescript-eslint/no-unsafe-enum-comparison */
import {
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Post, PostDocument } from './post.schema';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { UserType } from 'src/users/types/user';
import { PostStatus } from './types/post-status.enum';
import { PermitService } from 'src/permitio/permitio.service';
import { PERMIT_IO_RESOURCES } from 'src/permitio/types/resources';
import { ReviewPostDto } from './dto/review-post.dto';
import { AddCoAuthorDto } from './dto/add-co-author.dto';

@Injectable()
export class PostService {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    private permitService: PermitService,
  ) {}

  async createPost(
    createPostDto: CreatePostDto,
    user: UserType,
  ): Promise<Post> {
    const permit = this.permitService.getPermitInstance();
    const permitted = await permit.check(user.permitioUser.key, 'create', {
      type: PERMIT_IO_RESOURCES.POST,
      tenant: process.env.PERMIT_IO_TENANT || 'default',
    });

    if (!permitted) {
      throw new HttpException(
        'You are not permitted to create posts',
        HttpStatus.FORBIDDEN,
      );
    }

    const post = new this.postModel({
      ...createPostDto,
      createdBy: user._id,
      authors: [
        user._id,
        ...(createPostDto.authors?.map((id) => new Types.ObjectId(id)) || []),
      ],
      status: PostStatus.DRAFT,
    });

    return await post.save();
  }

  async getAllPosts(
    user: UserType,
    status?: string,
    tag?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ posts: Post[]; total: number; page: number; limit: number }> {
    const permit = this.permitService.getPermitInstance();

    const permitted = await permit.check(user.permitioUser.key, 'read', {
      type: PERMIT_IO_RESOURCES.POST,
      tenant: process.env.PERMIT_IO_TENANT || 'default',
    });

    if (!permitted) {
      throw new HttpException(
        'You are not permitted to view posts',
        HttpStatus.FORBIDDEN,
      );
    }

    const query: any = { isDeleted: false };

    // If user is not admin or editor, only show published posts
    if (user.role !== 'admin' && user.role !== 'editor') {
      query.status = PostStatus.PUBLISHED;
    } else if (status) {
      query.status = status;
    }

    if (tag) {
      query.tags = { $in: [tag] };
    }

    const skip = (page - 1) * limit;
    const total = await this.postModel.countDocuments(query);
    const posts = await this.postModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'firstName lastName email')
      .populate('authors', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email');

    return {
      posts,
      total,
      page,
      limit,
    };
  }

  async getMyPosts(
    user: UserType,
    status?: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ posts: Post[]; total: number; page: number; limit: number }> {
    const query: any = {
      isDeleted: false,
      $or: [{ createdBy: user._id }, { authors: { $in: [user._id] } }],
    };

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    const total = await this.postModel.countDocuments(query);
    const posts = await this.postModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'firstName lastName email')
      .populate('authors', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email');

    return {
      posts,
      total,
      page,
      limit,
    };
  }

  async getPendingReviewPosts(
    user: UserType,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ posts: Post[]; total: number; page: number; limit: number }> {
    const permit = this.permitService.getPermitInstance();

    const permitted = await permit.check(user.permitioUser.key, 'review', {
      type: PERMIT_IO_RESOURCES.POST,
      tenant: process.env.PERMIT_IO_TENANT || 'default',
    });

    if (!permitted) {
      throw new HttpException(
        'You are not permitted to review posts',
        HttpStatus.FORBIDDEN,
      );
    }

    const query = { status: PostStatus.PENDING_REVIEW, isDeleted: false };
    const skip = (page - 1) * limit;
    const total = await this.postModel.countDocuments(query);
    const posts = await this.postModel
      .find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('createdBy', 'firstName lastName email')
      .populate('authors', 'firstName lastName email');

    return {
      posts,
      total,
      page,
      limit,
    };
  }

  async getPostById(id: string, user: UserType): Promise<Post> {
    const post = await this.postModel
      .findOne({ _id: id, isDeleted: false })
      .populate('createdBy', 'firstName lastName email')
      .populate('authors', 'firstName lastName email')
      .populate('approvedBy', 'firstName lastName email');

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const permit = this.permitService.getPermitInstance();

    // If post is not published, check permissions
    if (post.status !== PostStatus.PUBLISHED) {
      // Check if user is author/co-author
      const isAuthor = post.authors.some(
        (author) => author._id.toString() === user?._id?.toString(),
      );

      // If user is not the author, check if they have permission to read
      if (!isAuthor) {
        const permitted = await permit.check(user.permitioUser.key, 'read', {
          type: PERMIT_IO_RESOURCES.POST,
          tenant: process.env.PERMIT_IO_TENANT || 'default',
        });

        if (!permitted) {
          throw new HttpException(
            'You are not permitted to view this post',
            HttpStatus.FORBIDDEN,
          );
        }
      }
    }

    // Increment view count
    post.viewsCount += 1;
    await post.save();

    return post;
  }

  async updatePost(
    id: string,
    updatePostDto: UpdatePostDto,
    user: UserType,
  ): Promise<Post> {
    const post = await this.postModel.findOne({ _id: id, isDeleted: false });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const permit = this.permitService.getPermitInstance();

    // Check if user is author/co-author
    const isAuthor = post.authors.some(
      (author) => author.toString() === user?._id?.toString(),
    );

    // If not author, check if user has edit permission
    if (!isAuthor) {
      const permitted = await permit.check(user.permitioUser.key, 'edit', {
        type: PERMIT_IO_RESOURCES.POST,
        tenant: process.env.PERMIT_IO_TENANT || 'default',
      });

      if (!permitted) {
        throw new HttpException(
          'You are not permitted to edit this post',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    // If user is not an author but an editor, add to revision history
    if (!isAuthor && (user.role === 'editor' || user.role === 'admin')) {
      post.revisionHistory.push({
        updatedAt: new Date(),
        updatedBy: user._id ? user._id : new Types.ObjectId(),
      });
    }

    // Update post
    for (const key in updatePostDto) {
      if (key === 'status' && !['admin', 'editor'].includes(user.role)) {
        continue; // Skip status update if user is not admin or editor
      }
      post[key] = updatePostDto[key];
    }

    return await post.save();
  }

  async submitForReview(id: string, user: UserType): Promise<Post> {
    const post = await this.postModel.findOne({ _id: id, isDeleted: false });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Check if user is author/co-author
    const isAuthor = post.authors.some(
      (author) => author.toString() === user?._id?.toString(),
    );

    if (!isAuthor) {
      throw new HttpException(
        'Only authors can submit posts for review',
        HttpStatus.FORBIDDEN,
      );
    }

    if (post.status !== PostStatus.DRAFT) {
      throw new HttpException(
        'Only draft posts can be submitted for review',
        HttpStatus.BAD_REQUEST,
      );
    }

    post.status = PostStatus.PENDING_REVIEW;
    return await post.save();
  }

  async reviewPost(
    id: string,
    reviewPostDto: ReviewPostDto,
    user: UserType,
  ): Promise<Post> {
    const post = await this.postModel.findOne({ _id: id, isDeleted: false });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const permit = this.permitService.getPermitInstance();

    // Check if user has review permission
    const permitted = await permit.check(user.permitioUser.key, 'review', {
      type: PERMIT_IO_RESOURCES.POST,
      tenant: process.env.PERMIT_IO_TENANT || 'default',
    });

    if (!permitted) {
      throw new HttpException(
        'You are not permitted to review posts',
        HttpStatus.FORBIDDEN,
      );
    }

    if (post.status !== PostStatus.PENDING_REVIEW) {
      throw new HttpException(
        'Only pending review posts can be reviewed',
        HttpStatus.BAD_REQUEST,
      );
    }

    post.status = reviewPostDto.status as PostStatus;

    if (reviewPostDto.status === PostStatus.REJECTED) {
      post.rejectedReason = reviewPostDto.rejectedReason;
    } else if (reviewPostDto.status === PostStatus.APPROVED) {
      post.approvedBy = user._id;
    }

    // Add to revision history
    post.revisionHistory.push({
      updatedAt: new Date(),
      updatedBy: user._id || new Types.ObjectId(),
    });

    return await post.save();
  }

  async publishPost(id: string, user: UserType): Promise<Post> {
    const post = await this.postModel.findOne({ _id: id, isDeleted: false });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const permit = this.permitService.getPermitInstance();

    // Check if user has publish permission
    const permitted = await permit.check(user.permitioUser.key, 'publish', {
      type: PERMIT_IO_RESOURCES.POST,
      tenant: process.env.PERMIT_IO_TENANT || 'default',
    });

    if (!permitted) {
      throw new HttpException(
        'You are not permitted to publish posts',
        HttpStatus.FORBIDDEN,
      );
    }

    if (post.status !== PostStatus.APPROVED) {
      throw new HttpException(
        'Only approved posts can be published',
        HttpStatus.BAD_REQUEST,
      );
    }

    post.status = PostStatus.PUBLISHED;
    post.publishedAt = new Date();

    return await post.save();
  }

  async archivePost(id: string, user: UserType): Promise<Post> {
    const post = await this.postModel.findOne({ _id: id, isDeleted: false });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const permit = this.permitService.getPermitInstance();

    // Check if user is author/co-author
    const isAuthor = post.authors.some(
      (author) => author.toString() === user?._id?.toString(),
    );

    // If not author, check if user has archive permission
    if (!isAuthor) {
      const permitted = await permit.check(user.permitioUser.key, 'archive', {
        type: PERMIT_IO_RESOURCES.POST,
        tenant: process.env.PERMIT_IO_TENANT || 'default',
      });

      if (!permitted) {
        throw new HttpException(
          'You are not permitted to archive this post',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    post.status = PostStatus.ARCHIVED;
    return await post.save();
  }

  async addCoAuthor(
    id: string,
    addCoAuthorDto: AddCoAuthorDto,
    user: UserType,
  ): Promise<Post> {
    const post = await this.postModel.findOne({ _id: id, isDeleted: false });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Check if user is the primary author (created the post)
    if (post.createdBy.toString() !== user?._id?.toString()) {
      throw new HttpException(
        'Only the primary author can add co-authors',
        HttpStatus.FORBIDDEN,
      );
    }

    // Check if user is already a co-author
    if (
      post.authors.some((author) => author.toString() === addCoAuthorDto.userId)
    ) {
      throw new HttpException(
        'User is already a co-author',
        HttpStatus.BAD_REQUEST,
      );
    }

    post.authors.push(new Types.ObjectId(addCoAuthorDto.userId));
    return await post.save();
  }

  async removeCoAuthor(
    id: string,
    authorId: string,
    user: UserType,
  ): Promise<Post> {
    const post = await this.postModel.findOne({ _id: id, isDeleted: false });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Check if user is the primary author (created the post)
    if (post.createdBy.toString() !== user?._id?.toString()) {
      throw new HttpException(
        'Only the primary author can remove co-authors',
        HttpStatus.FORBIDDEN,
      );
    }

    // Check if trying to remove primary author
    if (post.createdBy.toString() === authorId) {
      throw new HttpException(
        'Cannot remove primary author',
        HttpStatus.BAD_REQUEST,
      );
    }

    post.authors = post.authors.filter(
      (author) => author.toString() !== authorId,
    );
    return await post.save();
  }

  async deletePost(id: string, user: UserType): Promise<{ message: string }> {
    const post = await this.postModel.findOne({ _id: id, isDeleted: false });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    const permit = this.permitService.getPermitInstance();

    // Check if user is author
    const isAuthor = post.authors.some(
      (author) => author.toString() === user?._id?.toString(),
    );

    // If not author, check if user has delete permission
    if (!isAuthor) {
      const permitted = await permit.check(user.permitioUser.key, 'delete', {
        type: PERMIT_IO_RESOURCES.POST,
        tenant: process.env.PERMIT_IO_TENANT || 'default',
      });

      if (!permitted) {
        throw new HttpException(
          'You are not permitted to delete this post',
          HttpStatus.FORBIDDEN,
        );
      }
    }

    // Soft delete
    post.isDeleted = true;
    await post.save();

    return { message: 'Post deleted successfully' };
  }
}
