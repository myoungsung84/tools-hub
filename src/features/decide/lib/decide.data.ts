/* =========================
 * Types
 * ========================= */
export type DecideChoice =
  | 'BUY_NOW'
  | 'BUY_STRONG'
  | 'BUY_YES'
  | 'BUY_MAYBE'
  | 'THINK'
  | 'WAIT'
  | 'SKIP_MAYBE'
  | 'SKIP_YES'
  | 'SKIP_STRONG'
  | 'SKIP_NOW'
  | 'COIN'
  | 'SLEEP'

export type ResultState =
  | { status: 'idle' }
  | { status: 'spinning' }
  | { status: 'done'; choice: DecideChoice; message: string; emoji: string }

/* =========================
 * Data
 * ========================= */
export const CHOICES = {
  BUY_NOW: {
    label: '지금 당장!',
    message: '오늘이 아니면 또 미룬다. 그냥 질러!',
    emoji: '🔥',
    color: '#ef4444',
    textColor: 'text-red-300',
  },
  BUY_STRONG: {
    label: '무조건 사라',
    message: '이건 사는 쪽이 이긴다.',
    emoji: '💪',
    color: '#f97316',
    textColor: 'text-orange-300',
  },
  BUY_YES: {
    label: '사도 됨',
    message: '만족감 꽤 나올 각.',
    emoji: '✨',
    color: '#eab308',
    textColor: 'text-yellow-300',
  },
  BUY_MAYBE: {
    label: '사볼까?',
    message: '반품각만 체크하고 가자.',
    emoji: '🤔',
    color: '#10b981',
    textColor: 'text-emerald-300',
  },
  THINK: {
    label: '한 번 더',
    message: '하루만 더 생각해봐.',
    emoji: '💭',
    color: '#0ea5e9',
    textColor: 'text-sky-300',
  },
  WAIT: {
    label: '기다려',
    message: '가격 떨어질 때까지 존버.',
    emoji: '⏰',
    color: '#3b82f6',
    textColor: 'text-blue-300',
  },
  SKIP_MAYBE: {
    label: '굳이…?',
    message: '없어도 잘 산다.',
    emoji: '🤷',
    color: '#8b5cf6',
    textColor: 'text-violet-300',
  },
  SKIP_YES: {
    label: '이번엔 패스',
    message: '지금은 아니다.',
    emoji: '🚫',
    color: '#a855f7',
    textColor: 'text-purple-300',
  },
  SKIP_STRONG: {
    label: '절대 금지',
    message: '지갑이 비명 지른다.',
    emoji: '⛔',
    color: '#ec4899',
    textColor: 'text-pink-300',
  },
  SKIP_NOW: {
    label: '지금은 아님',
    message: '타이밍이 아니다.',
    emoji: '❌',
    color: '#64748b',
    textColor: 'text-slate-300',
  },
  COIN: {
    label: '동전 던져',
    message: '너무 비슷하다. 랜덤 가자.',
    emoji: '🪙',
    color: '#94a3b8',
    textColor: 'text-slate-400',
  },
  SLEEP: {
    label: '자고 보자',
    message: '밤엔 다 사고 싶다.',
    emoji: '😴',
    color: '#475569',
    textColor: 'text-slate-300',
  },
} as const

export const CHOICE_ORDER = Object.keys(CHOICES) as DecideChoice[]

/* =========================
 * State UI (idle/spinning)
 * ========================= */
export const STATE_UI = {
  idle: {
    emoji: '🎯',
    headline: '결정 대기',
    message: '룰렛을 돌려 결정을 내려보세요',
  },
  spinning: {
    emoji: '🌀',
    headline: '결정 중…',
    message: '운명이 계산 중입니다',
  },
} as const
