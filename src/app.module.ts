// src/app.module.ts
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { PortfolioModule } from './portfolio/portfolio.module';

import { User } from './users/entities/user.entity';
import { RiskProfile } from './risk-profile/entities/risk-profile.entity';
import { Post } from './posts/entities/post.entity';

@Module({
  imports: [
    // 1. Global Environment Configuration
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    // 2. Rate Limiting Setup
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 10,
      },
    ]),

    // 3. Single Unified Database Connection
    TypeOrmModule.forRootAsync({
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const dbUrl = configService.get<string>('DATABASE_URL');

    if (dbUrl) {
      return {
        type: 'postgres',
        url: dbUrl,
        autoLoadEntities: true,
        synchronize: true, // Set to false in high-security production if using migrations
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      };
    }

    // Fallback to local individual environment variables
    return {
      type: 'postgres',
      host: configService.get<string>('DB_HOST', 'localhost'),
      port: configService.get<number>('DB_PORT', 5432),
      username: configService.get<string>('DB_USERNAME', 'postgres'),
      password: configService.get<string>('DB_PASSWORD', 'postgres'),
      database: configService.get<string>('DB_NAME', 'robo'),
      autoLoadEntities: true,
      synchronize: true,
    };
  },
}),

    // 4. Feature Modules
    UsersModule,
    AuthModule,
    PortfolioModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}