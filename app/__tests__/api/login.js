import faker from 'faker'
import { create, remove } from '../../db/user'
import handler from '../../pages/api/login'
import { post } from '../../utils/http'
import { testServer } from '../../utils/testing'

describe('login', () => {
  const userData = {
    email: faker.internet.email(),
    password: faker.internet.password(),
  }

  test('returns 400 with no credentials', async () => {
    expect.assertions(2)

    const { url, server } = await testServer(handler)
    const { res, data } = await post(url)

    expect(data.error).toBe('missing login data')
    expect(res.status).toBe(400)

    return server.close()
  })

  test('returns 401 with wrong credentials', async () => {
    expect.assertions(2)

    const { url, server } = await testServer(handler)
    const { res, data } = await post(url, userData)

    expect(data.error).toBe('authentication failed')
    expect(res.status).toBe(401)

    return server.close()
  })

  test('logs in succesfully with correct credentials', async () => {
    expect.assertions(2)

    await create(userData)

    const { url, server } = await testServer(handler)
    const { res, data } = await post(url, userData)

    expect(res.status).toBe(200)
    expect(data.user.email).toBe(userData.email)

    await remove(data.user)

    return server.close()
  })
})
