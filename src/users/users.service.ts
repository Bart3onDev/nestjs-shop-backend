import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { Prisma, User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(createUser: CreateUserDto) {
    try {
      return await this.prismaService.user.create({
        data: {
          ...createUser,
          password: await bcrypt.hash(createUser.password, 10),
        },
        select: {
          email: true,
          id: true,
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new UnprocessableEntityException('Email already exists.');
      }

      throw error;
    }
  }

  async getUser(filter: Prisma.UserWhereUniqueInput): Promise<User> {
    return this.prismaService.user.findUniqueOrThrow({
      where: filter,
    });
  }
}
