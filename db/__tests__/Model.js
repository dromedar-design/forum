if ('on' === process.env.MOCK) {
  jest.mock('@db/Model')
}

import faker from 'faker'
import { Comment, User } from '../Model'

let data
beforeEach(async () => {
  await User.reset()
  data = {
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.name.findName(),
  }
})

describe('model', () => {
  test('models can be created', async () => {
    const current = await User.create(data)

    expect(typeof current.id).toBe('string')
    expect(current.email).toBe(data.email)
    expect(current.name).toBe(data.name)

    try {
      await Comment.find(current.id)
    } catch (e) {
      expect(e.message).toBe('instance not found')
    }
  })

  test('models can be retrieved', async () => {
    await User.create(data)
    const users = await User.all()

    expect(users.length).toBe(1)
    expect(typeof users[0].id).toBe('string')
    expect(users[0].email).toBe(data.email)
    expect(users[0].name).toBe(data.name)
  })

  test('returns the model if one of the attribute is a ref', async () => {
    const parent = await User.create(data)

    const current = await User.create({
      ...data,
      email: faker.internet.email(),
      parent: User.ref(parent),
    })

    expect(current.parent.id).toBe(parent.id)
  })

  test('model can be removed', async () => {
    const current = await User.create(data)
    expect(current.email).toBe(data.email)

    const response = await User.remove(current)

    expect(response).toBe(true)
  })

  test('one model can be found', async () => {
    const current = await User.create(data)
    const response = await User.find(current.id)

    expect(response).toStrictEqual(current)
  })

  test('one model can be found by any value', async () => {
    const current = await User.create(data)

    const response = await User.where(['email', current.email])

    expect(response).toStrictEqual([current])
  })

  test('login is only possible for existing users', async () => {
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

    await User.create(data)

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

  test('auth user can only be retrieved when logged in', async () => {
    const current = await User.create(data)

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

  test('can only log out when logged in and the secret is correct', async () => {
    await User.create(data)

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

  test('models can be updated', async () => {
    const current = await User.create(data)

    const newData = {
      name: faker.name.findName(),
      newField: faker.lorem.sentence(),
      _hidden: faker.lorem.sentence(),
    }

    const updated = await User.update({
      ...current,
      ...newData,
    })

    expect(updated.email).toBe(data.email)
    expect(updated.name).toBe(newData.name)
    expect(updated.newField).toBe(newData.newField)
    expect(typeof updated._hidden).toBe('undefined')
  })
})
