import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Patch,
  Param,
  Delete,
  Head,
  Options,
  Header,
  ParseIntPipe,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '../decorators/roles.decorator';
import { RolesGuard } from '../guards/roles.guard';
import { Role } from '../auth/enum/role.enum';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
// src/users/users.controller.ts
import { Query } from '@nestjs/common'; // add Query to your @nestjs/common imports

@ApiTags('users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  // GET /users/me — must be placed BEFORE @Get(':id')
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  @ApiOperation({ summary: 'Get current logged-in user profile' })
  @ApiResponse({ status: 200, description: 'Profile returned successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getProfile(@Request() req: any) {
    return this.usersService.findOne(req.user.id);
  }

  // GET /users — Admin only
   @Get()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'List all users with pagination (Admin only)' })
  @ApiResponse({ status: 200, description: 'Paginated user records' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN role' })
  findAll(@Query() paginationQuery: PaginationQueryDto) {
    return this.usersService.findAll(paginationQuery);
  }

  // Single GET /users/:id endpoint
  @Get(':id')
  @ApiOperation({ summary: 'Find user by ID' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Head(':id')
  @Header('X-User-Exists', 'true')
  async head(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.findOne(id);
  }

  @Options(':id')
  @Header('Allow', 'GET, HEAD, PUT, PATCH, DELETE, OPTIONS')
  options() {
    return;
  }

  @Put(':id')
  @Patch(':id')
  @ApiOperation({ summary: 'Update user by ID' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(id, updateUserDto);
  }

  // DELETE /users/:id — Admin only, returns 204 No Content
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Delete a user by ID (Admin only)' })
  @ApiResponse({ status: 204, description: 'User deleted (No Content)' })
  @ApiResponse({ status: 403, description: 'Forbidden - requires ADMIN role' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.usersService.remove(id);
  }
}