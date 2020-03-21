import { User } from '@db/Model'
import handler from '@pages/api/logout'
import { get } from '@utils/http'
import { testServer } from '@utils/testing'
import faker from 'faker'

jest.mock('@db/Model')

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
  await User.remove(u)
  db.server.close()
})

describe('user', () => {
  test('needs a secret to log out', async () => {
    const { res, error } = await get(db.url)

    expect(error).toBe('missing auth token')
    expect(res.status).toBe(401)
  })

  test('needs a valid secret to log out', async () => {
    const { res, error } = await get(db.url, {
      secret: 'wrong_secret',
    })

    expect(error).toBe('unauthorized')
    expect(res.status).toBe(401)
  })

  test('logs in succesfully only with correct secret', async () => {
    const { res } = await get(db.url, { secret })

    expect(res.status).toBe(200)
  })
})
