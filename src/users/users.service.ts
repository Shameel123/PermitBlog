import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { createUserDto } from '../auth/DTO/createUsers.dto';
import { User, userDocument } from './users.schema';
import { PermitService } from 'src/permitio/permitio.service';
import { AssignRoleDto } from './dto/assignRole.dto';
import { UserType } from './types/user';
import { PERMIT_IO_RESOURCES } from 'src/permitio/types/resources';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<userDocument>,
    private permitService: PermitService,
  ) {}

  async createUser(createUserDto: createUserDto): Promise<Partial<User>> {
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
        attributes: {
          id: createUser._id.toString(), // (this is important because resource.id will be compared to user.id)
          first_name: createUser.firstName,
          last_name: createUser.lastName,
        },
        role_assignments: [
          { role: 'viewer', tenant: process.env.PERMIT_IO_TENANT || 'default' },
        ],
      });

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

    const userCreated = await createUser.save();

    return {
      email: userCreated.email,
      role: userCreated.role,
    };
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

  async assignRole(body: AssignRoleDto): Promise<any> {
    const { email, role } = body;

    // Find the user by email
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const permitioUser = await this.permitService
      .getPermitInstance()
      .api.assignRole({
        user: user.permitioUser.key,
        role,
        tenant: process.env.PERMIT_IO_TENANT || 'default',
      });

    if (!permitioUser) {
      throw new HttpException(
        'Failed to assign role to user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    // Update the user's role in the local database
    const updatedUser = await this.userModel.findOneAndUpdate(
      { email },
      { role },
      { new: true },
    );

    // If no user is updated, throw an exception
    if (!updatedUser) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    // Return the updated user information
    return {
      email: updatedUser.email,
      role: updatedUser.role,
    };
  }

  async getAllUsers(user: UserType): Promise<any> {
    const permit = this.permitService.getPermitInstance();

    const permitted = await permit.check(user.permitioUser.key, 'read', {
      type: PERMIT_IO_RESOURCES.User,
      tenant: process.env.PERMIT_IO_TENANT || 'default',
    });

    if (permitted) {
      console.log(
        `${user.permitioUser.email} is PERMITTED to read other users`,
      );
    } else {
      console.log(
        `${user.permitioUser.email} is NOT PERMITTED to read other users`,
      );
      throw new HttpException(
        'You are not permitted to read other users',
        HttpStatus.FORBIDDEN,
      );
    }

    // Proceed with fetching all users
    const users = await this.userModel.find();
    if (!users) {
      throw new HttpException('No users found', HttpStatus.NOT_FOUND);
    }
    return users;
  }
}
