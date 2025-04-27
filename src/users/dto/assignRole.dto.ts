import { IsEmail, IsIn } from 'class-validator';

export class AssignRoleDto {
  @IsEmail()
  email: string;

  @IsIn(['admin', 'editor', 'viewer'])
  role: 'admin' | 'editor' | 'viewer';
}
