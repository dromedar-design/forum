import faker from 'faker'
import { create, login, remove } from '../../db/user'
import handler from '../../pages/api/user'
import { get } from '../../utils/http'
import { testServer } from '../../utils/testing'

describe('user', () => {
  const userData = {
    email: faker.internet.email(),
    password: faker.internet.password(),
  }

  test('returns 401 with wrong credentials', async () => {
    expect.assertions(2)

    const { url, server } = await testServer(handler)
    const { res, error } = await get(url)

    expect(error).toBe('missing auth secret')
    expect(res.status).toBe(401)

    return server.close()
  })

  test('logs in succesfully with correct credentials', async () => {
    expect.assertions(2)

    await create(userData)
    const secret = await login(userData)

    const { url, server } = await testServer(handler)
    const { res, user } = await get(url, { secret })

    expect(res.status).toBe(200)
    expect(user.email).toBe(userData.email)

    await remove(user)

    server.close()
  })
})
