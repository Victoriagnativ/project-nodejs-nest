import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UserFilterDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { BaseQueryDto } from '../common/validator/base.query.validator';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  // private userList = [];
  // createUser(createUserDto: CreateUserDto) {
  //   const index = new Date().valueOf();
  //   this.userList.push({
  //     ...createUserDto,
  //     id: index,
  //   });
  //   return this.userList[0];
  // }

  async findAllUsers(query?: BaseQueryDto): Promise<any> {
    const options = {
      page: +query?.page || 1,
      limit: +query?.limit || 10,
    };
    const [entities, total] = await this.userRepository.findAndCount({
      where: { isActive: true },
      select: {
        email: true,
        firstName: true,
        id: true,
      },
      relations: {
        posts: true,
      },
      skip: (options.page - 1) * options.limit,
      take: options.limit,
    });

    return {
      page: options.page,
      pages: Math.ceil(total / options.limit),
      countItems: total,
      entities: entities,
    };
  }
  async findOneUser(idOrEmail: string): Promise<User | null> {
    const queryBuilder = this.userRepository.createQueryBuilder('user');

    if (isUUID(idOrEmail)) {
      queryBuilder.where('user.id = :id', { id: idOrEmail });
    } else {
      queryBuilder.where('user.email = :email', { email: idOrEmail });
    }

    return await queryBuilder.getOne();
  }

  async filterUsers(query?: UserFilterDto): Promise<any> {
    const options = {
      page: +query?.page || 1,
      limit: +query?.limit || 10,
    };

    const filters: any = {};
    const order: any = {};

    Object.keys(query).forEach((key) => {
      const value = query[key];
      if (value) {
        if (key === 'order' || key === 'sortBy') {
          order[key] = value.toUpperCase();
        } else {
          filters[key] = `%${value}%`;
        }
      }
    });

    console.log('Filters:', filters);
    console.log('Order:', order);

    try {
      const queryBuilder = this.userRepository
        .createQueryBuilder('user')
        .leftJoinAndSelect('user.posts', 'post');

      Object.keys(filters).forEach((key) => {
        queryBuilder.andWhere(`user.${key} LIKE :${key}`, {
          [key]: filters[key],
        });
      });

      if (order.sortBy) {
        queryBuilder.orderBy(`user.${order.sortBy}`, order.order || 'ASC');
      }

      queryBuilder.skip((options.page - 1) * options.limit).take(options.limit);

      const [entities, total] = await queryBuilder.getManyAndCount();

      return {
        page: options.page,
        pages: Math.ceil(total / options.limit),
        countItems: total,
        entities: entities,
      };
    } catch (err) {
      console.error('Error in filtering users:', err);
      throw new BadRequestException('Failed to filter users');
    }
  }

  async updateUser(userId: string, data: UpdateUserDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User no found');
    }
    Object.assign(user, data);
    user.updatedAt = new Date();

    return this.userRepository.save(user);
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.delete(id);

    if (user.affected === 0) {
      throw new NotFoundException('User not found');
    }

    return { message: 'User deleted successfully' };
  }
}
