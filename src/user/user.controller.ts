import {
  Controller,
  Get,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  NotFoundException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  UserFilterDto,
  UserItemDto,
} from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiExtraModels, ApiTags } from '@nestjs/swagger';
import { BaseQueryDto } from '../common/validator/base.query.validator';
import {
  ApiPaginatedResponse,
  PaginatedDto,
} from '../common/interface/responce.interface';
import { AuthGuard } from '@nestjs/passport';

@ApiTags('User')
@ApiExtraModels(UserItemDto, PaginatedDto)
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @UseGuards(AuthGuard())
  @ApiPaginatedResponse('entities', UserItemDto)
  @Get('/list')
  findAllUsers(@Query() query: BaseQueryDto) {
    return this.userService.findAllUsers(query);
  }
  @UseGuards(AuthGuard())
  @Get(':idOrEmail')
  async getUser(@Param('idOrEmail') idOrEmail: string) {
    const user = await this.userService.findOneUser(idOrEmail);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  @UseGuards(AuthGuard())
  @Get('')
  filterUsers(@Query() query: UserFilterDto) {
    console.log(query);
    return this.userService.filterUsers(query);
  }
  @UseGuards(AuthGuard())
  @Patch('/update')
  updateUser(@Request() req: any, @Body() data: UpdateUserDto) {
    console.log('User from req:', req.user);
    return this.userService.updateUser(req.user.id, data);
  }
  @UseGuards(AuthGuard())
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
