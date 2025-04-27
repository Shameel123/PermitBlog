import { Types } from 'mongoose';

export interface UserType {
  _id?: Types.ObjectId;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'viewer';
  firstName?: string;
  lastName?: string;
}
