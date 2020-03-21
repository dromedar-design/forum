import faker from 'faker'
import { create, login, remove } from '../../db/user'
import handler from '../../pages/api/user'
import { get } from '../../utils/http'
import { testServer } from '../../utils/testing'

let db, u
const userData = {
  email: faker.internet.email(),
  password: faker.internet.password(),
}

beforeAll(async () => {
  db = await testServer(handler)
  const resp = await create(userData)
  u = resp.user
})

afterAll(async () => {
  await remove(u)
  db.server.close()
})

describe('user', () => {
  test('returns 401 without wrong credentials', async () => {
    const { res, error } = await get(db.url)

    expect(error).toBe('missing auth secret')
    expect(res.status).toBe(401)
  })

  test('does not log in with wrong secret', async () => {
    const { res, error } = await get(db.url, {
      secret: 'wrong_secret',
    })

    expect(error).toBe('unauthorized')
    expect(res.status).toBe(401)
  })

  test('logs in succesfully only with correct secret', async () => {
    const secret = await login(userData)
    const { res, user } = await get(db.url, { secret })

    expect(res.status).toBe(200)
    expect(user.email).toBe(userData.email)
  })
})
