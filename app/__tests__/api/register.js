import faker from 'faker'
import { remove } from '../../db/user'
import handler from '../../pages/api/register'
import { post } from '../../utils/http'
import { testServer } from '../../utils/testing'

describe('register', () => {
  test('responds 400 to invalid data', async () => {
    expect.assertions(2)

    const { url, server } = await testServer(handler)
    const { res, data } = await post(url)

    expect(data.error).toBe('missing register data')
    expect(res.status).toBe(400)

    return server.close()
  })

  test('creates user when the data is correct', async () => {
    expect.assertions(3)

    const userData = {
      email: faker.internet.email(),
      password: faker.internet.password(),
      name: faker.name.findName(),
    }

    const { url, server } = await testServer(handler)
    const { res, data } = await post(url, userData)

    expect(res.status).toBe(200)
    expect(data.user.email).toBe(userData.email)
    expect(data.user.name).toBe(userData.name)

    await remove(data.user)

    return server.close()
  })
})
