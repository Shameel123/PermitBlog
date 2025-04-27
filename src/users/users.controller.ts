import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiKeyAuthGuard } from 'src/auth/guards/api-key-auth.guard';
import { AssignRoleDto } from './dto/assignRole.dto';

@Controller('user')
export class UsersController {
  constructor(private readonly UserService: UsersService) {}

  @Post('/assign-role')
  @UseGuards(ApiKeyAuthGuard)
  async assignRole(@Body() body: AssignRoleDto): Promise<any> {
    return await this.UserService.assignRole(body);
  }
}
