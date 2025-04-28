import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import slugify from 'slugify';
import * as sanitizeHtml from 'sanitize-html';
import { IsString, IsOptional } from 'class-validator';
import { Transform, TransformFnParams, Type } from 'class-transformer';

export type PostDocument = HydratedDocument<Post>;

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true })
  title: string;

  @IsString()
  @IsOptional()
  @Transform((params: TransformFnParams) => {
    const value = params.value as string;
    return sanitizeHtml(value, {
      allowedTags: [
        'b',
        'i',
        'em',
        'strong',
        'a',
        'p',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
        'ul',
        'ol',
        'li',
        'iframe',
        'img',
        'span',
        'div',
      ],
      allowedAttributes: {
        a: ['href', 'target', 'rel', 'class', 'id'],
        iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen'],
        div: ['class', 'id'],
        img: ['src', 'alt', 'class', 'id'],
      },
      allowedIframeHostnames: ['www.youtube.com'],
      allowedSchemes: ['data', 'http', 'https'],
    });
  })
  @Prop({ required: true })
  content: string;

  @Prop({
    type: String,
    enum: [
      'draft',
      'pending_review',
      'approved',
      'published',
      'rejected',
      'archived',
    ],
    default: 'draft',
  })
  status: string;

  @Prop({ type: [{ type: Types.ObjectId, ref: 'User' }], required: true })
  authors: Types.ObjectId[];

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  createdBy: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'User' })
  approvedBy?: Types.ObjectId;

  @Prop({ type: Date })
  publishedAt?: Date;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop({ type: String })
  slug: string;

  @Prop({ type: String })
  coverImage?: string;

  @Prop({ type: Boolean, default: false })
  isFeatured: boolean;

  @Prop({ type: String })
  rejectedReason?: string;

  @Prop({
    type: [
      {
        updatedAt: { type: Date, default: Date.now },
        updatedBy: { type: Types.ObjectId, ref: 'User' },
      },
    ],
    default: [],
  })
  revisionHistory: {
    updatedAt: Date;
    updatedBy: Types.ObjectId;
  }[];

  @Prop({ type: Number, default: 0 })
  viewsCount: number;

  @Prop({ type: Number, default: 0 })
  likesCount: number;

  @Prop({ type: Boolean, default: false })
  isDeleted: boolean;
}

export const PostSchema = SchemaFactory.createForClass(Post);

// Auto-generate slug
PostSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});
