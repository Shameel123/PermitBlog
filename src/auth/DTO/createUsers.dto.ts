import { IsEmail, IsOptional, Length, IsIn } from 'class-validator';

export class createUserDto {
  @IsEmail()
  email: string;

  @Length(5, 25)
  password: string;

  @IsIn(['admin', 'editor', 'author', 'viewer'])
  role = 'viewer';

  @IsOptional()
  firstName: string;

  @IsOptional()
  lastName: string;
}
