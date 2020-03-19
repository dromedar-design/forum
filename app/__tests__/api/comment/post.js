import faker from 'faker'
import { remove as removeComment } from '../../../db/comment'
import { create, login, remove as removeUser } from '../../../db/user'
import handler from '../../../pages/api/comment/post'
import { post } from '../../../utils/http'
import { testServer } from '../../../utils/testing'

let db, u, secret
const userData = {
  email: faker.internet.email(),
  password: faker.internet.password(),
}
const commentData = {
  text: faker.lorem.text(),
}

beforeAll(async () => {
  db = await testServer(handler)
  const resp = await create(userData)
  u = resp.user
  secret = await login(userData)
})

afterAll(async () => {
  await removeUser(u)
  db.server.close()
})

describe('register', () => {
  test('responds 401 to missing user', async () => {
    expect.assertions(2)

    const { res, error } = await post(db.url)

    expect(error).toBe('missing auth secret')
    expect(res.status).toBe(401)
  })

  test('responds 400 to invalid data', async () => {
    expect.assertions(2)

    const { res, error } = await post(`${db.url}?secret=${secret}`)

    expect(error).toBe('missing comment data')
    expect(res.status).toBe(400)
  })

  test('creates comment when the data is correct', async () => {
    expect.assertions(4)

    const { res, comment, items } = await post(
      `${db.url}?secret=${secret}`,
      commentData
    )

    expect(res.status).toBe(200)
    expect(comment.text).toBe(commentData.text)
    expect(comment.name).toBe(commentData.name)
    expect(items.length).toBe(0)

    await removeComment(comment)
  })

  test('creates comment with parent', async () => {
    expect.assertions(4)

    const { comment: parent } = await post(
      `${db.url}?secret=${secret}`,
      commentData
    )

    const { res, comment, items } = await post(`${db.url}?secret=${secret}`, {
      parent: parent.id,
      ...commentData,
    })

    console.log(comment, items)

    expect(res.status).toBe(200)
    expect(comment.text).toBe(commentData.text)
    expect(comment.name).toBe(commentData.name)
    expect(items.length).toBe(1)

    await removeComment(parent)
    await removeComment(comment)
  })
})
