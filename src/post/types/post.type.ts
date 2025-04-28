import { Types } from 'mongoose';
import { PostStatus } from './post-status.enum';

export type PostType = {
  _id: Types.ObjectId;
  title: string;
  content: string;
  status: PostStatus;
  authors: Types.ObjectId[];
  createdBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  publishedAt?: Date;
  tags: string[];
  slug: string;
  coverImage?: string;
  isFeatured: boolean;
  rejectedReason?: string;
  revisionHistory: {
    updatedAt: Date;
    updatedBy: Types.ObjectId;
  }[];
  viewsCount: number;
  likesCount: number;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
};
