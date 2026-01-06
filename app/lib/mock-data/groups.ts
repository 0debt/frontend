export const isMockGroupsEnabled = process.env.MOCK_GROUPS === "true"

export type Group = {
  _id: string
  name: string
  description?: string
  imageUrl?: string
  members: string[]
  ownerId: string
  createdAt: string
  updatedAt?: string
}

export const MOCK_GROUPS: Group[] = [
  {
    _id: 'demo-group',
    name: 'Demo Group',
    description: 'Grupo de demostración para desarrollo',
    imageUrl: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop',
    members: ['mock-id', 'user-1', 'user-2', 'user-3', 'user-4'],
    ownerId: 'mock-id',
    createdAt: '2024-01-01T00:00:00.000Z',
  },
  {
    _id: 'vacation-2024',
    name: 'Vacation 2024',
    description: 'Gastos del viaje de verano',
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=300&fit=crop',
    members: ['mock-id', 'user-1', 'user-2'],
    ownerId: 'mock-id',
    createdAt: '2024-06-01T00:00:00.000Z',
  },
  {
    _id: 'shared-apt',
    name: 'Piso Compartido',
    description: 'Gastos del apartamento',
    imageUrl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop',
    members: ['mock-id', 'user-3', 'user-4'],
    ownerId: 'user-3',
    createdAt: '2024-03-01T00:00:00.000Z',
  },
]
