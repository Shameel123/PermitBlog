import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type userDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  password: string;

  @Prop({
    type: String,
    required: true,
    enum: ['admin', 'editor', 'author', 'viewer'],
    default: 'viewer',
  })
  role: string;

  @Prop({ type: String, required: false })
  firstName: string;

  @Prop({ type: String, required: false })
  lastName: string;

  // New field to store Permit.io user data as an object
  @Prop({ type: Object, required: false })
  permitioUser: {
    key: string;
    id: string;
    organization_id: string;
    project_id: string;
    environment_id: string;
    associated_tenants: any[];
    roles: any[];
    created_at: string;
    updated_at: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    attributes: any;
  };
}

export const userSchema = SchemaFactory.createForClass(User);
