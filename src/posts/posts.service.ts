import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Post } from './entities/post.entity';
import { User } from '../users/entities/user.entity';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    const user = await this.userRepository.findOneBy({ id: createPostDto.userId });
    if (!user) {
      throw new NotFoundException(`User with ID ${createPostDto.userId} not found`);
    }

    const post = this.postRepository.create({
      title: createPostDto.title,
      content: createPostDto.content,
      user,
    });

    return await this.postRepository.save(post);
  }

  async findAll(paginationQuery?: PaginationQueryDto) {
    const { page = 1, limit = 10 } = paginationQuery || {};
    const skip = (page - 1) * limit;

    const [data, total] = await this.postRepository.findAndCount({
      relations: {
        user: true,
      },
      skip,
      take: limit,
      order: {
        id: 'ASC',
      },
    });

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number): Promise<Post> {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: {
        user: true,
      },
    });

    if (!post) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    const post = await this.findOne(id);
    this.postRepository.merge(post, updatePostDto);
    return await this.postRepository.save(post);
  }

  async remove(id: number): Promise<void> {
    const post = await this.findOne(id);
    await this.postRepository.remove(post);
  }
}