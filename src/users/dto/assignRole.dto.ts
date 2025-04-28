import { IsEmail, IsIn } from 'class-validator';

export class AssignRoleDto {
  @IsEmail()
  email: string;

  @IsIn(['admin', 'editor', 'author', 'viewer'])
  role: 'admin' | 'editor' | 'author' | 'viewer';
}
