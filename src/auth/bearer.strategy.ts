import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRedisClient, RedisClient } from '@webeleon/nestjs-redis';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRedisClient() private readonly redisClient: RedisClient,
    private readonly authService: AuthService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: 'Secret',
    });
  }

  async validate(token: any) {
    console.log('Received token:', token);
    try {
      if (!token || !token.userId) {
        throw new UnauthorizedException('Invalid token: no userId found');
      }

      const redisKey = `user-token-${token.userId}`;
      const tokenExists = await this.redisClient.exists(redisKey);
      console.log(`Checking Redis key: ${redisKey}, Exists: ${tokenExists}`);

      if (!tokenExists) {
        throw new UnauthorizedException('Token not found in Redis');
      }

      return this.authService.validateUser(token.userId, token.email);
    } catch (e) {
      console.log(e);
      throw new UnauthorizedException();
    }
  }
}
