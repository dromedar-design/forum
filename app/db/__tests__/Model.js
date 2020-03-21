import faker from 'faker'
import { Comment, User } from '../Model'
import { User as Mock } from '../__mocks__/Model'

let data,
  current = null

beforeAll(async () => {
  // Make sure that the test database is empty
  ;(await User.all()).forEach(x => User.remove(x))
  ;(await Comment.all()).forEach(x => Comment.remove(x))
})

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
    User.remove(current)
    current = null
  }
})

describe('model', () => {
  test('models can be created', async () => {
    expect.assertions(3)

    current = await User.create(data)

    expect(typeof current.id).toBe('string')
    expect(current.email).toBe(data.email)
    expect(current.name).toBe(data.name)
  })

  test('mocked models can be created', () => {
    const mock = Mock.create(data)

    expect(typeof mock.id).toBe('string')
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

  test('mocked models can be retrieved', () => {
    Mock.create(data)
    const mocks = Mock.all()

    expect(mocks.length).toBe(1)
    expect(typeof mocks[0].id).toBe('string')
    expect(mocks[0].email).toBe(data.email)
    expect(mocks[0].name).toBe(data.name)
  })

  test('returns the id if one of the attribute is a ref', async () => {
    expect.assertions(1)

    const parent = await User.create(data)

    current = await User.create({
      ...data,
      email: faker.internet.email(),
      parent: User.ref(parent),
    })

    expect(current.parent).toBe(parent.id)

    await User.remove(parent)
  })

  test('returns the mocked id if one of the attribute is a ref', () => {
    const parent = Mock.create(data)

    const mockData = {
      ...data,
      email: faker.internet.email(),
      parent: Mock.ref(parent),
    }
    const mock = Mock.create(mockData)

    expect(mock.parent).toBe(parent.id)
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

  test('mocked model can be removed', () => {
    const mock = Mock.create(data)
    expect(mock.email).toBe(data.email)

    const response = Mock.remove(mock)

    expect(response).toBe(true)
  })

  test('one model can be found', async () => {
    expect.assertions(1)

    current = await User.create(data)

    const response = await User.find(current.id)

    expect(response).toStrictEqual(current)
  })

  test('one mocked model can be found', () => {
    const mock = Mock.create(data)

    const response = Mock.find(mock.id)

    expect(response).toStrictEqual(mock)
  })

  test('one model can be found by any value', async () => {
    expect.assertions(1)

    current = await User.create(data)

    const response = await User.where(['email', current.email])

    expect(response).toStrictEqual([current])
  })

  test('one mocked model can be found by any value', () => {
    const mock = Mock.create(data)

    const response = Mock.where(['email', mock.email])

    expect(response).toStrictEqual([mock])
  })

  test('login is only possible for existing users', async () => {
    expect.assertions(4)

    try {
      await User.login()
    } catch (e) {
      // console.error(e)
      expect(e.message).toBe('invalid login data')
    }

    try {
      await User.login(data)
    } catch (e) {
      // console.error(e)
      expect(e.message).toBe('authentication failed')
    }

    current = await User.create(data)

    try {
      await User.login({
        ...data,
        password: 'wrong_password',
      })
    } catch (e) {
      // console.error(e)
      expect(e.message).toBe('authentication failed')
    }

    const secret = await User.login(data)

    expect(typeof secret).toBe('string')
  })

  test('mock login is only possible for existing users', () => {
    expect(() => {
      Mock.login()
    }).toThrowError('invalid login data')

    expect(() => {
      Mock.login(data)
    }).toThrowError('authentication failed')

    Mock.create(data)

    expect(() => {
      Mock.login({
        ...data,
        password: 'wrong_password',
      })
    }).toThrowError('authentication failed')

    const secret = Mock.login(data)

    expect(typeof secret).toBe('string')
  })

  test('auth user can only be retrieved when logged in', async () => {
    expect.assertions(3)

    current = await User.create(data)

    try {
      await User.bySecret()
    } catch (e) {
      // console.error(e)
      expect(e.message).toBe('invalid auth token')
    }

    try {
      await User.bySecret('wrong_secret')
    } catch (e) {
      // console.error(e)
      expect(e.message).toBe('unauthorized')
    }

    const secret = await User.login(data)
    const loggedIn = await User.bySecret(secret)

    expect(loggedIn).toStrictEqual(current)
  })

  test('mocked auth user can only be retrieved when logged in', () => {
    const mock = Mock.create(data)

    expect(() => {
      Mock.bySecret()
    }).toThrowError('invalid auth token')

    expect(() => {
      Mock.bySecret('wrong_secret')
    }).toThrowError('unauthorized')

    const secret = Mock.login(data)
    const loggedIn = Mock.bySecret(secret)

    expect(loggedIn).toStrictEqual(mock)
  })

  test('can only log out when logged in and the secret is correct', async () => {
    expect.assertions(3)

    current = await User.create(data)

    try {
      await User.logout()
    } catch (e) {
      // console.error(e)
      expect(e.message).toBe('invalid auth token')
    }

    try {
      await User.logout('wrong_secret')
    } catch (e) {
      // console.error(e)
      expect(e.message).toBe('unauthorized')
    }

    const secret = await User.login(data)
    const resp = await User.logout(secret)

    expect(resp).toBe(true)
  })

  test('can only log out when logged in and the secret is correct', () => {
    Mock.create(data)

    try {
      Mock.logout()
    } catch (e) {
      // console.error(e)
      expect(e.message).toBe('invalid auth token')
    }

    try {
      Mock.logout('wrong_secret')
    } catch (e) {
      // console.error(e)
      expect(e.message).toBe('unauthorized')
    }

    const secret = Mock.login(data)
    const resp = Mock.logout(secret)

    expect(resp).toBe(true)
  })
})
