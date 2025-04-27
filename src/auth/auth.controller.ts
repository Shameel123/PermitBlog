import {
  Controller,
  Post,
  UsePipes,
  ValidationPipe,
  Body,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { createUserDto } from './DTO/createUsers.dto';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './DTO/login.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private readonly UserService: UsersService,
  ) {}

  @Post('login')
  async login(@Body() login: LoginDto): Promise<any> {
    return await this.authService.login(login);
  }

  @Post('/register')
  @UsePipes(ValidationPipe)
  async createUser(@Body() userData: createUserDto): Promise<createUserDto> {
    return await this.UserService.createUser(userData);
  }
}
