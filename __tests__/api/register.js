import { User } from '@db/Model'
import handler from '@pages/api/register'
import { post } from '@utils/http'
import { testServer } from '@utils/testing'
import faker from 'faker'

jest.mock('@db/Model')

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
    const { res, error } = await post(db.url)

    expect(res.status).toBe(400)
    expect(error).toBe('missing register data')
  })

  test('creates user when the data is correct', async () => {
    const { res, user } = await post(db.url, userData)

    expect(res.status).toBe(201)
    expect(user.email).toBe(userData.email)
    expect(user.name).toBe(userData.name)

    User.remove(user)
  })
})
