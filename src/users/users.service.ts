import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { createUserDto } from '../auth/DTO/createUsers.dto';
import { User, userDocument } from './users.schema';
import { PermitService } from 'src/permitio/permitio.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<userDocument>,
    private permitService: PermitService,
  ) {}

  async createUser(createUserDto: createUserDto): Promise<User> {
    const userExists = await this.userModel.findOne({
      email: createUserDto?.email,
    });

    if (userExists) {
      throw new HttpException('Account already exists', HttpStatus.BAD_REQUEST);
    }

    const salt = await bcrypt.genSalt();
    createUserDto.password = await bcrypt.hash(createUserDto.password, salt);

    const createUser = new this.userModel(createUserDto);

    const permitioUser = await this.permitService
      .getPermitInstance()
      .api.syncUser({
        key: createUser._id.toString(),
        email: createUser.email,
        role_assignments: [
          { role: 'viewer', tenant: process.env.PERMIT_IO_TENANT || 'default' },
        ],
      });

    console.log('permitioUser', permitioUser);

    createUser.permitioUser = {
      key: permitioUser.key,
      id: permitioUser.id,
      organization_id: permitioUser.organization_id,
      project_id: permitioUser.project_id,
      environment_id: permitioUser.environment_id,
      associated_tenants: permitioUser.associated_tenants || [],
      roles: permitioUser.roles || [],
      created_at: permitioUser.created_at,
      updated_at: permitioUser.updated_at,
      email: permitioUser.email || '',
      first_name: permitioUser.first_name || '',
      last_name: permitioUser.last_name || '',
      attributes: permitioUser.attributes,
    };

    return createUser.save();
  }

  async findOne(email: string): Promise<User> {
    const user = await this.userModel.findOne({
      email,
    });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }
}
