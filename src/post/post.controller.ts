import {
  Controller,
  Get,
  Post,
  Body,
  Request,
  Param,
  Delete,
  Patch,
  UseGuards,
  Req,
} from '@nestjs/common';
import { PostService } from './post.service';
import { PostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('post')
export class PostController {
  constructor(private readonly postService: PostService) {}
  @UseGuards(AuthGuard())
  @Post('/create')
  createPost(@Req() req: any, @Body() data: PostDto) {
    return this.postService.createPost(req.user.id, data);
  }

  @Get(':userId')
  getUserPosts(@Param('userId') userId: string) {
    return this.postService.getUserPosts(userId);
  }
  @UseGuards(AuthGuard())
  @Patch(':postId')
  updatePost(
    @Param('postId') postId: string,
    @Request() req: any,
    @Body() data: UpdatePostDto,
  ) {
    return this.postService.updatePost(postId, req.user.id, data);
  }
  @UseGuards(AuthGuard())
  @Delete(':postId')
  async deletePost(@Request() req: any, @Param('postId') postId: string) {
    console.log('User from req:', req.user);
    return this.postService.deletePost(req.user, postId);
  }
}
