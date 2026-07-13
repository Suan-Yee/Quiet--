import type { User } from '../types/post'

export const mockCurrentUser: User = {
  id: 1,
  name: 'Maya Chen',
  username: 'maya-chen',
  email: 'maya@example.com',
  profileImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=240&q=80',
  coverImage: '',
  bio: 'I write about the quiet systems, humane constraints, and daily rituals that help independent writers keep returning to the page.',
  authorDescription: 'Essayist on creative routines',
  role: 'user',
  isActive: true,
  createdAt: '2024-01-12T00:00:00.000Z',
  updatedAt: '2026-07-01T00:00:00.000Z',
}
