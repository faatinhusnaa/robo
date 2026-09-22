// src/auth/constants/risk-quiz.constant.ts

export interface QuizOption {
  id: string;
  text: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

// 1. PUBLIC: This is what the frontend/user gets to see
export const RISK_QUESTIONS: QuizQuestion[] = [
  {
    id: 'time_horizon',
    question: 'When do you plan to start withdrawing significant funds?',
    options: [
      { id: 'short', text: 'In less than 1 year' },
      { id: 'medium_short', text: 'In 1 to 3 years' },
      { id: 'medium_long', text: 'In 3 to 7 years' },
      { id: 'long', text: 'In 7+ years' },
    ],
  },
  {
    id: 'volatility_reaction',
    question: 'If your portfolio drops 20% in a month, what would you do?',
    options: [
      { id: 'panic_sell', text: 'Panic and sell everything immediately' },
      { id: 'cut_losses', text: 'Sell a portion to cut losses' },
      { id: 'hold', text: 'Do nothing and wait for recovery' },
      { id: 'buy_dip', text: 'Invest more money while prices are low' },
    ],
  },
  {
    id: 'goal',
    question: 'What is your primary investment goal?',
    options: [
      { id: 'preserve', text: 'Capital preservation: Never lose principal' },
      { id: 'balanced', text: 'Modest growth with low fluctuation' },
      { id: 'growth', text: 'Aggressive wealth accumulation over time' },
    ],
  },
  {
    id: 'experience',
    question: 'What is your level of investment experience?',
    options: [
      { id: 'beginner', text: 'Complete beginner (never invested before)' },
      { id: 'intermediate', text: 'Moderate knowledge (stocks/mutual funds)' },
      { id: 'expert', text: 'Advanced / Active trader' },
    ],
  },
];

// 2. PRIVATE: Internal score weights (Users NEVER see or submit these)
export const QUIZ_SCORE_MAP: Record<string, Record<string, number>> = {
  time_horizon: {
    short: 0,
    medium_short: 5,
    medium_long: 10,
    long: 20,
  },
  volatility_reaction: {
    panic_sell: 0,
    cut_losses: 5,
    hold: 15,
    buy_dip: 25,
  },
  goal: {
    preserve: 0,
    balanced: 10,
    growth: 25,
  },
  experience: {
    beginner: 5,
    intermediate: 15,
    expert: 25,
  },
};