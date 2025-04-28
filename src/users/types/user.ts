import { Types } from 'mongoose';

export interface UserType {
  _id?: Types.ObjectId;
  email: string;
  password: string;
  role: 'admin' | 'editor' | 'viewer';
  firstName?: string;
  lastName?: string;
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
