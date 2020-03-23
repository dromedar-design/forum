import { User } from '@db/Model'
import { act, renderHook } from '@testing-library/react-hooks'
import useAuth, { AuthProvider } from '@utils/useAuth'
import faker from 'faker'
import fetch from 'jest-fetch-mock'
import React from 'react'

jest.mock('@db/Model')

beforeAll(() => {
  fetch.enableFetchMocks()
})

beforeEach(() => {
  fetch.resetMocks()
})

test('user is null by default', async () => {
  const wrapper = ({ children }) => (
    <AuthProvider initialUser={null} children={children} />
  )
  fetch.mockResponse(JSON.stringify({}))

  const { result } = renderHook(() => useAuth(), { wrapper })

  expect(result.current.user).toBeNull()
})

test('returns correct user when it is available', async () => {
  const data = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }
  const user = await User.create(data)
  fetch.mockResponse(JSON.stringify({ user }))

  const wrapper = ({ children }) => (
    <AuthProvider initialUser={user} children={children} />
  )

  const { result } = renderHook(() => useAuth(), { wrapper })

  expect(result.current.user).toStrictEqual(user)

  User.remove(user)
})

test('returns the user only when he is logged in', async () => {
  const data = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }
  const user = await User.create(data)
  fetch.mockResponse(JSON.stringify({ user }))

  const wrapper = ({ children }) => (
    <AuthProvider initialUser={null} children={children} />
  )

  const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper })
  expect(result.current.user).toBeNull()

  act(() => {
    result.current.login(data)
  })

  await waitForNextUpdate()
  expect(result.current.user).toStrictEqual(user)

  User.remove(user)
})

test('creating a new user is available and able to log out', async () => {
  const data = {
    name: faker.name.findName(),
    email: faker.internet.email(),
    password: faker.internet.password(),
  }
  const { password, ...user } = {
    ...data,
    id: faker.random.uuid(),
  }
  fetch.mockResponse(JSON.stringify({ user }))

  const wrapper = ({ children }) => (
    <AuthProvider initialUser={null} children={children} />
  )

  const { result, waitForNextUpdate } = renderHook(() => useAuth(), { wrapper })
  expect(result.current.user).toBeNull()

  act(() => {
    result.current.register(data)
  })

  await waitForNextUpdate()
  expect(result.current.user).toStrictEqual(user)

  act(() => {
    result.current.logout()
  })

  await waitForNextUpdate()
  expect(result.current.user).toBeNull()
})
