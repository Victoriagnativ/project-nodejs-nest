import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../database/entities/user.entity';
import { RedisModule } from '@webeleon/nestjs-redis';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './bearer.strategy';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    forwardRef(() => RedisModule.forFeature()),
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: true,
    }),
    JwtModule.registerAsync({
      global: true,
      useFactory: () => ({
        secret: 'Secret',
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  exports: [TypeOrmModule, PassportModule],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
