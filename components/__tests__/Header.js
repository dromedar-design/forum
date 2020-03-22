import { User } from '@db/Model'
import { render, screen } from '@testing-library/react'
import { AuthProvider } from '@utils/useAuth'
import faker from 'faker'
import fetch from 'jest-fetch-mock'
import React from 'react'
import Header from '../Header'

jest.mock('@db/Model')

beforeAll(() => {
  fetch.enableFetchMocks()
})

test('shows logged out state by default', async () => {
  render(
    <AuthProvider initialUser={null}>
      <Header />
    </AuthProvider>
  )

  expect(screen.queryByText('Logout')).toBeNull()
  expect(screen.queryByText('Login')).not.toBeNull()
})

test('shows user info when logged in', async () => {
  const data = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }
  const user = await User.create(data)
  fetch.mockResponse(JSON.stringify({ user }))

  render(
    <AuthProvider initialUser={user}>
      <Header />
    </AuthProvider>
  )

  expect(screen.queryByText('Login')).toBeNull()
  expect(screen.queryByText('Logout')).not.toBeNull()
  expect(screen.queryByText(data.email)).not.toBeNull()
})
