import { BalanceResponse, Expense, GroupStats } from '@/app/lib/expenses'
import { UserInfo } from '@/app/lib/users'

export const isMockExpensesEnabled = process.env.MOCK_EXPENSES === "true"

export const MOCK_USERS: UserInfo[] = [
  { _id: 'user-1', name: 'Paloma', email: 'paloma@test.com', avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=paloma' },
  { _id: 'user-2', name: 'Paco', email: 'paco@test.com', avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=paco' },
  { _id: 'user-3', name: 'María', email: 'maria@test.com', avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=maria' },
  { _id: 'user-4', name: 'Carlos', email: 'carlos@test.com', avatar: 'https://api.dicebear.com/7.x/thumbs/svg?seed=carlos' },
]

export const MOCK_EXPENSES: Expense[] = [
  {
    _id: 'exp-1',
    description: 'Cena en restaurante italiano',
    totalAmount: 85.50,
    originalAmount: 85.50,
    currency: 'EUR',
    exchangeRate: 1,
    date: '2024-12-08T20:30:00.000Z',
    payerId: 'user-1',
    groupId: 'demo-group',
    splitType: 'EQUAL',
    category: 'FOOD',
    shares: [
      { userId: 'user-1', amount: 21.38 },
      { userId: 'user-2', amount: 21.38 },
      { userId: 'user-3', amount: 21.38 },
      { userId: 'user-4', amount: 21.36 },
    ],
    createdAt: '2024-12-08T20:35:00.000Z'
  },
  {
    _id: 'exp-2',
    description: 'Taxi al aeropuerto',
    totalAmount: 45.00,
    originalAmount: 45.00,
    currency: 'EUR',
    exchangeRate: 1,
    date: '2024-12-07T08:00:00.000Z',
    payerId: 'user-2',
    groupId: 'demo-group',
    splitType: 'EQUAL',
    category: 'TRANSPORT',
    shares: [
      { userId: 'user-1', amount: 22.50 },
      { userId: 'user-2', amount: 22.50 },
    ],
    createdAt: '2024-12-07T08:15:00.000Z'
  },
  {
    _id: 'exp-3',
    description: 'Supermercado',
    totalAmount: 62.30,
    originalAmount: 62.30,
    currency: 'EUR',
    exchangeRate: 1,
    date: '2024-12-06T18:00:00.000Z',
    payerId: 'user-3',
    groupId: 'demo-group',
    splitType: 'EQUAL',
    category: 'FOOD',
    shares: [
      { userId: 'user-1', amount: 15.58 },
      { userId: 'user-2', amount: 15.58 },
      { userId: 'user-3', amount: 15.58 },
      { userId: 'user-4', amount: 15.56 },
    ],
    createdAt: '2024-12-06T18:30:00.000Z'
  },
  {
    _id: 'exp-4',
    description: 'Entradas cine',
    totalAmount: 36.00,
    originalAmount: 40.00,
    currency: 'USD',
    exchangeRate: 0.90,
    date: '2024-12-05T21:00:00.000Z',
    payerId: 'user-4',
    groupId: 'demo-group',
    splitType: 'EQUAL',
    category: 'ENTERTAINMENT',
    shares: [
      { userId: 'user-1', amount: 9.00 },
      { userId: 'user-2', amount: 9.00 },
      { userId: 'user-3', amount: 9.00 },
      { userId: 'user-4', amount: 9.00 },
    ],
    createdAt: '2024-12-05T21:30:00.000Z'
  },
  {
    _id: 'exp-5',
    description: 'Hotel 2 noches',
    totalAmount: 240.00,
    originalAmount: 240.00,
    currency: 'EUR',
    exchangeRate: 1,
    date: '2024-12-04T14:00:00.000Z',
    payerId: 'user-1',
    groupId: 'demo-group',
    splitType: 'EQUAL',
    category: 'ACCOMMODATION',
    shares: [
      { userId: 'user-1', amount: 60.00 },
      { userId: 'user-2', amount: 60.00 },
      { userId: 'user-3', amount: 60.00 },
      { userId: 'user-4', amount: 60.00 },
    ],
    createdAt: '2024-12-04T14:30:00.000Z'
  },
]

export const MOCK_BALANCE: BalanceResponse = {
  balances: {
    'user-1': 176.84,  // Le deben dinero
    'user-2': -40.16,  // Debe dinero
    'user-3': -61.18,  // Debe dinero
    'user-4': -75.50,  // Debe dinero
  },
  payments: [
    { from: 'user-4', to: 'user-1', amount: 75.50 },
    { from: 'user-3', to: 'user-1', amount: 61.18 },
    { from: 'user-2', to: 'user-1', amount: 40.16 },
  ]
}

export const MOCK_STATS: GroupStats = {
  totalSpent: 468.80,
  count: 5,
  byCategory: {
    'FOOD': 147.80,
    'TRANSPORT': 45.00,
    'ACCOMMODATION': 240.00,
    'ENTERTAINMENT': 36.00,
  },
  lastUpdated: '2024-12-08T21:00:00.000Z'
}
