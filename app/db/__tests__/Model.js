import faker from 'faker'
import { Mock, User } from '../Model'

let data,
  current = null

beforeEach(() => {
  data = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.name.findName(),
  }
})

afterEach(async () => {
  Mock.reset()

  if (current) {
    await User.remove(current)

    current = null
  }
})

describe('model', () => {
  test('models can be created', async () => {
    expect.assertions(2)

    current = await User.create(data)

    expect(current.email).toBe(data.email)
    expect(current.name).toBe(data.name)
  })

  test('mocked models can be created', async () => {
    expect.assertions(2)

    const mock = Mock.create(data)

    expect(mock.email).toBe(data.email)
    expect(mock.name).toBe(data.name)
  })

  test('models can be retrieved', async () => {
    expect.assertions(4)

    current = await User.create(data)
    const users = await User.all()

    expect(users.length).toBe(1)
    expect(typeof users[0].id).toBe('string')
    expect(users[0].email).toBe(data.email)
    expect(users[0].name).toBe(data.name)
  })

  test('mocked models can be retrieved', async () => {
    expect.assertions(4)

    await Mock.create(data)
    const mocks = Mock.all()

    expect(mocks.length).toBe(1)
    expect(typeof mocks[0].id).toBe('string')
    expect(mocks[0].email).toBe(data.email)
    expect(mocks[0].name).toBe(data.name)
  })

  test('model can be removed', async () => {
    expect.assertions(2)

    current = await User.create(data)
    expect(current.email).toBe(data.email)

    const response = await User.remove(current)

    expect(response).toBe(true)

    //cleanup
    current = null
  })

  test('mocked model can be removed', async () => {
    expect.assertions(2)

    const mock = await Mock.create(data)
    expect(mock.email).toBe(data.email)

    const response = await Mock.remove(mock)

    expect(response).toBe(true)
  })

  test('one model can be found', async () => {
    expect.assertions(1)

    current = await User.create(data)

    const response = await User.find(current.id)

    expect(response).toStrictEqual(current)
  })

  test('one mocked model can be found', async () => {
    expect.assertions(1)

    const mock = await Mock.create(data)

    const response = await Mock.find(mock.id)

    expect(response).toStrictEqual(mock)
  })

  test('one model can be found by any value', async () => {
    expect.assertions(1)

    current = await User.create(data)

    const response = await User.where(['email', current.email])

    expect(response).toStrictEqual([current])
  })

  test('one mocked model can be found by any value', async () => {
    expect.assertions(1)

    const mock = await Mock.create(data)

    const response = await Mock.where(['email', mock.email])

    expect(response).toStrictEqual([mock])
  })
})
