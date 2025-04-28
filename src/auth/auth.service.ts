import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { userDocument } from 'src/users/users.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, userId: string): Promise<any> {
    try {
      const user = (await this.usersService.findOne(email)) as userDocument;

      if (user && ['admin', 'editor', 'viewer'].includes(user.role)) {
        if (user._id?.toString() === userId) {
          const { password, ...result } = user;
          return result;
        }
        throw new HttpException('Invalid user role', HttpStatus.FORBIDDEN);
      }
    } catch (e) {
      console.log('validateUser error:', e);
    }
  }

  async login(login: any) {
    try {
      if (!login) {
        throw new HttpException('No data provided', HttpStatus.FORBIDDEN);
      }

      if (!login.email || !login.password) {
        throw new HttpException(
          'Email and password are required',
          HttpStatus.FORBIDDEN,
        );
      }

      const { email, password } = login;

      const user: any = await this.usersService.findOne(email);

      const { id: userId, role: role } = user;

      // validate password with hashing
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        throw new HttpException(
          'Password verification failed',
          HttpStatus.FORBIDDEN,
        );
      }

      // payload here should be object as always
      const payload = {
        email,
        userId,
        role,
      };

      return {
        email,
        role,
        access_token: this.jwtService.sign(payload),
      };
    } catch (e) {
      throw new HttpException(e.message, HttpStatus.FORBIDDEN);
    }
  }

  decodedJwt(accessToken: string) {
    return this.jwtService.verify(accessToken);
  }
}
