import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PostDto } from './dto/create-post.dto';
// import { UpdatePostDto } from './dto/update-post.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from '../database/entities/post.entity';
import { User } from '../database/entities/user.entity';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  private logger: Logger;
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}
  async createPost(userId: string, data: PostDto) {
    try {
      const post = await this.postRepository.save(
        this.postRepository.create({
          ...data,
          user_id: userId,
        }),
      );
      return post;
    } catch (err) {
      this.logger.error('Error creating post:', err.message);
      throw new BadRequestException('Create post failed');
    }
  }

  getUserPosts(userId: string) {
    return this.postRepository.find({ where: { user: { id: userId } } });
  }

  async updatePost(postId: string, userId: string, data: UpdatePostDto) {
    const post = await this.postRepository.findOne({
      where: { id: postId, user: { id: userId } },
    });

    if (!post) {
      throw new NotFoundException('Post no found');
    }
    Object.assign(post, data);
    post.updatedAt = new Date();

    return this.postRepository.save(post);
  }

  async deletePost(user: User, postId: string) {
    const post = await this.postRepository.findOne({
      where: { id: postId },
      relations: ['user'],
    });
    if (!post) throw new NotFoundException('Post not found');
    if (post.user.id !== user.id)
      throw new ForbiddenException('Cannot delete this post');

    const postRemove = this.postRepository.remove(post);
    return { message: `Post ${postRemove} deleted successfully` };
  }
}
