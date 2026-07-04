import { mockCurrentUser } from '../data/mockCurrentUser'

const MOCK_AUTH_USER_KEY = 'quiet-pages-mock-user'

export type MockAuthUser = {
  name: string
  email: string
  avatar?: string
  description?: string
}

export function saveMockUser(user: MockAuthUser) {
  window.localStorage.setItem(MOCK_AUTH_USER_KEY, JSON.stringify(user))
}

export function getMockUser(): MockAuthUser | null {
  const storedUser = window.localStorage.getItem(MOCK_AUTH_USER_KEY)

  if (!storedUser) {
    return null
  }

  try {
    return JSON.parse(storedUser) as MockAuthUser
  } catch {
    return null
  }
}

export function getCurrentMockUser() {
  return getMockUser() ?? mockCurrentUser
}
