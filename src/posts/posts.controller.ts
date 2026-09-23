// src/posts/posts.controller.ts
import { Controller, Post, Get, Body, UseGuards, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Req() req: any, @Body() body: { title: string; content: string }) {
    // Extracts user from JWT payload validated by AuthGuard
    const userId = req.user.id || req.user.sub;
    return this.postsService.create({
      title: body.title,
      content: body.content,
      userId: userId,
    });
  }

  @Get()
  findAll() {
    return this.postsService.findAll();
  }
}