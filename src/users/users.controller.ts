import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiKeyAuthGuard } from 'src/auth/guards/api-key-auth.guard';
import { AssignRoleDto } from './dto/assignRole.dto';
import { UserType } from './types/user';
import { GetUser } from 'src/auth/get-user.decorator';
import { JwtAuthGuard } from 'src/auth/strategies/jwt-auth.guard';

@Controller('user')
export class UsersController {
  constructor(private readonly UserService: UsersService) {}

  @Post('/assign-role')
  @UseGuards(ApiKeyAuthGuard)
  async assignRole(@Body() body: AssignRoleDto): Promise<any> {
    return await this.UserService.assignRole(body);
  }

  @Get('all')
  @UseGuards(JwtAuthGuard)
  async getAllUsers(@GetUser() user: UserType): Promise<any> {
    return await this.UserService.getAllUsers(user);
  }
}
