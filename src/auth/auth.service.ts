import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { InjectRedisClient, RedisClient } from '@webeleon/nestjs-redis';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private redisUserKey = 'user-token';
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRedisClient() private readonly redisClient: RedisClient,
    private readonly jwtService: JwtService,
  ) {}
  async singUpUser(data: CreateUserDto): Promise<User> {
    try {
      const findUser = await this.userRepository.findOne({
        where: { email: data.email },
      });
      if (findUser) {
        throw new BadRequestException('User with this email already exist.');
      }
      const password = await bcrypt.hash(data.password, 10);
      const user = await this.userRepository.save(
        this.userRepository.create({
          ...data,
          password,
        }),
      );
      console.log('Hashed password:', password);
      return user;
    } catch (error) {
      console.error('Error hashing password:', error);
    }
  }
  async validateUser(userId: string, userEmail: string): Promise<any> {
    if (!userId || !userEmail) {
      throw new UnauthorizedException();
    }
    const user = this.userRepository.findOne({
      where: {
        id: userId,
        email: userEmail,
      },
    });
    if (!userId) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async signInUser({
    email,
    password,
  }: {
    email: string;
    password: string;
  }): Promise<{ accessToken: string }> {
    const user = await this.userRepository.findOne({
      where: { email },
    });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = this.jwtService.sign({ userId: user.id, email: user.email });

    await this.redisClient.setEx(
      `${this.redisUserKey}-${user.id}`,
      24 * 60 * 60,
      token,
    );

    return { accessToken: token };
  }
  async logoutUser(userId: string): Promise<{ message: string }> {
    const key = `user-token-${userId}`;

    const exists = await this.redisClient.exists(key);
    if (exists) {
      await this.redisClient.del(key);
    }

    return { message: 'Logged out successfully' };
  }
}
