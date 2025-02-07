import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';

import {
  CreateUserDto,
  SignInDto,
  SingUpDto,
} from '../user/dto/create-user.dto';
import { ApiOkResponse, ApiResponse } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @ApiResponse({ status: HttpStatus.CREATED, type: CreateUserDto })
  @ApiOkResponse({ type: SingUpDto })
  @Post('/register')
  createUser(@Body() body: CreateUserDto) {
    return this.authService.singUpUser(body);
  }
  @Post('/login')
  async signInUser(@Body() signInDto: SignInDto) {
    return this.authService.signInUser(signInDto);
  }
  @UseGuards(AuthGuard())
  @Post('logout')
  async logoutUser(@Req() req: any) {
    const userId = req.user.userId;
    return this.authService.logoutUser(userId);
  }
}
