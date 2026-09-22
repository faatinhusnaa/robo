import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../users/entities/user.entity'; // <-- 1. Import UserRole here
import { RiskProfile, RiskTier } from '../risk-profile/entities/risk-profile.entity';
import { UserAnswersDto, RegisterWithQuizDto } from './dto/register.dto';
import { RISK_QUESTIONS, QUIZ_SCORE_MAP } from './constants/risk-quiz.constant';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(RiskProfile)
    private readonly riskProfileRepository: Repository<RiskProfile>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterWithQuizDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const { score, tier } = this.calculateRisk(dto.quiz);

    // Explicitly set role to UserRole.USER (or cast if role comes from DTO)
    const user = this.userRepository.create({
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
      role: UserRole.USER,
    });
    const savedUser = await this.userRepository.save(user);

    // Risk profile creation will now receive single User entity cleanly
    const profile = this.riskProfileRepository.create({
      score,
      tier,
      answers: dto.quiz,
      user: savedUser,
    });
    await this.riskProfileRepository.save(profile);

    const payload = {
      sub: savedUser.id,
      email: savedUser.email,
      role: savedUser.role,
    };
    const accessToken = this.jwtService.sign(payload);

    return {
      message: 'Registration successful',
      access_token: accessToken,
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
        role: savedUser.role,
      },
      risk_profile: {
        id: profile.id,
        score: profile.score,
        tier: profile.tier,
      },
    };
  }

  async login(email: string, pass: string) {
    // Explicitly pull the password ONLY here to verify credentials
    const user = await this.userRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isMatch = await bcrypt.compare(pass, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  }
  getQuizQuestions() {
    return RISK_QUESTIONS;
  }

  calculateRisk(answers: UserAnswersDto): { score: number; tier: RiskTier } {
    const horizonScore = QUIZ_SCORE_MAP.time_horizon[answers.time_horizon] ?? 0;
    const volatilityScore = QUIZ_SCORE_MAP.volatility_reaction[answers.volatility_reaction] ?? 0;
    const goalScore = QUIZ_SCORE_MAP.goal[answers.goal] ?? 0;
    const expScore = QUIZ_SCORE_MAP.experience[answers.experience] ?? 5;

    const total = horizonScore + volatilityScore + goalScore + expScore;

    let tier = RiskTier.CONSERVATIVE;
    if (total > 80) {
      tier = RiskTier.AGGRESSIVE;
    } else if (total > 65) {
      tier = RiskTier.GROWTH;
    } else if (total > 30) {
      tier = RiskTier.MODERATE;
    }

    return { score: total, tier };
  }
}