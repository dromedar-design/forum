import { User } from '@db/Model'
import { render } from '@testing-library/react'
import { AuthProvider } from '@utils/useAuth'
import faker from 'faker'
import fetch from 'jest-fetch-mock'
import React from 'react'
import Header from '../Header'

jest.mock('@db/Model')

beforeAll(() => {
  fetch.enableFetchMocks()
})

beforeEach(() => {
  fetch.resetMocks()
})

test('shows logged out state by default', async () => {
  const { queryByText } = render(
    <AuthProvider>
      <Header />
    </AuthProvider>
  )
  fetch.mockResponse(JSON.stringify({}))

  expect(queryByText('Logout')).toBeNull()
  expect(queryByText('Login')).not.toBeNull()
})

test('shows user info when logged in', async () => {
  const data = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }
  const user = await User.create(data)
  fetch.mockResponse(JSON.stringify({ user }))

  const { queryByText } = render(
    <AuthProvider initialUser={user}>
      <Header />
    </AuthProvider>
  )

  expect(queryByText('Login')).toBeNull()
  expect(queryByText('Logout')).not.toBeNull()
  expect(queryByText(data.email)).not.toBeNull()

  User.remove(user)
})
