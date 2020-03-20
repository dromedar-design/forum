import faker from 'faker'
import { User } from '../../db/Model'
import handler from '../../pages/api/register'
import { post } from '../../utils/http'
import { testServer } from '../../utils/testing'

let db
const userData = {
  email: faker.internet.email(),
  password: faker.internet.password(),
  name: faker.name.findName(),
}

beforeAll(async () => {
  db = await testServer(handler)
})

afterAll(async () => {
  db.server.close()
})

describe('register', () => {
  test('responds 400 to invalid data', async () => {
    expect.assertions(2)

    const { res, error } = await post(db.url)

    expect(error).toBe('missing register data')
    expect(res.status).toBe(400)
  })

  test('creates user when the data is correct', async () => {
    expect.assertions(3)

    const { res, user } = await post(db.url, userData)

    expect(res.status).toBe(200)
    expect(user.email).toBe(userData.email)
    expect(user.name).toBe(userData.name)

    await User.remove(user)
  })
})
