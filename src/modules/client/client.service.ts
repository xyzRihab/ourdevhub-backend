import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UpdateClientDto } from './dto/update-client.dto';
import { PrismaService } from 'src/common/services/prisma/prisma.service';

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async getProfile(id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!user) {
      throw new HttpException(
        `User with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    return {
      message: 'Profile fetched successfully',
      data: user,
    };
  }

  async update(id: string, updateClientDto: UpdateClientDto) {
    const existingUser = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingUser) {
      throw new HttpException(
        `User with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const updatedUser = await this.prisma.user.update({
      where: { id },
      data: {
        ...updateClientDto,
        updatedAt: new Date(),
      },
    });

    return {
      message: 'User updated successfully',
      data: updatedUser,
    };
  }

  async delete(id: string) {
    const existingUser = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });

    if (!existingUser) {
      throw new HttpException(
        `User with id ${id} not found`,
        HttpStatus.NOT_FOUND,
      );
    }

    const deletedUser = await this.prisma.user.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      message: 'User deleted successfully',
      data: deletedUser,
    };
  }

  async searchByUsername(query: string) {
    console.log('Searching users with:', query);
    const users = await this.prisma.user.findMany({
      where: {
        username: {
          startsWith: query,
          mode: 'insensitive',
        },
      },
      take: 10,
      select: {
        id: true,
        username: true,
        picture: true,
      },
    });
    return {
      message: 'Users fetched successfully',
      data: users,
    };
  }
}
