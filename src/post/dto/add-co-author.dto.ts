import { IsString } from 'class-validator';

export class AddCoAuthorDto {
  @IsString()
  userId: string;
}
