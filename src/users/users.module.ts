import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './users.controller';
import { User, userSchema } from './users.schema';
import { UsersService } from './users.service';
import { JwtService } from '@nestjs/jwt';
import { PermitService } from 'src/permitio/permitio.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: userSchema }]),
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtService, PermitService],
  exports: [UsersService],
})
export class UsersModule {}
