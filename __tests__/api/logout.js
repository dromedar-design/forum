if ('on' === process.env.MOCK) {
  jest.mock('@db/Model')
}

import { User } from '@db/Model'
import handler from '@pages/api/logout'
import { get } from '@utils/http'
import { testServer } from '@utils/testing'
import faker from 'faker'

let db, u, secret
const userData = {
  email: faker.internet.email(),
  password: faker.internet.password(),
}

beforeAll(async () => {
  db = await testServer(handler)
  u = await User.create(userData)
  secret = await User.login(userData)
})

afterAll(async () => {
  User.remove(u)
  db.server.close()
})

describe('user logout', () => {
  test('needs a secret to log out', async () => {
    const { res, error } = await get(db.url)

    expect(res.status).toBe(401)
    expect(error).toBe('missing auth token')
  })

  test('needs a valid secret to log out', async () => {
    const { res, error } = await get(db.url, {
      secret: 'wrong_secret',
    })

    expect(res.status).toBe(401)
    expect(error).toBe('unauthorized')
  })

  test('logs in succesfully with correct secret', async () => {
    const { res } = await get(db.url, { secret })

    expect(res.status).toBe(200)
  })
})
