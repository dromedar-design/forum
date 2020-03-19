import faker from 'faker'
import { create, remove } from '../../db/user'
import handler from '../../pages/api/login'
import { post } from '../../utils/http'
import { testServer } from '../../utils/testing'

let db
const userData = {
  email: faker.internet.email(),
  password: faker.internet.password(),
}

beforeAll(async () => {
  db = await testServer(handler)
})

afterAll(async () => {
  db.server.close()
})

describe('login', () => {
  test('returns 400 with no credentials', async () => {
    expect.assertions(2)

    const { res, error } = await post(db.url)

    expect(error).toBe('missing login data')
    expect(res.status).toBe(400)
  })

  test('returns 401 with wrong credentials', async () => {
    expect.assertions(2)

    const { res, error } = await post(db.url, userData)

    expect(error).toBe('authentication failed')
    expect(res.status).toBe(401)
  })

  test('logs in succesfully with correct credentials', async () => {
    expect.assertions(2)

    await create(userData)

    const { res, user } = await post(db.url, userData)

    expect(res.status).toBe(200)
    expect(user.email).toBe(userData.email)

    await remove(user)
  })
})
