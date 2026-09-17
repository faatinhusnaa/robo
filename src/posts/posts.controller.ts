import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(
    @CurrentUser() user: { id: number; email: string },
    @Body() createPostDto: Omit<CreatePostDto, 'userId'>,
  ) {
    return this.postsService.create({
      ...createPostDto,
      userId: user.id, // Enforces the authenticated user's ID
    });
  }
}