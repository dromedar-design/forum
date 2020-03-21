import { Comment, User } from '@db/Model'
import handler from '@pages/api/comment/post'
import { post } from '@utils/http'
import { testServer } from '@utils/testing'
import faker from 'faker'

jest.mock('@db/Model')

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
  u = await User.create(userData)
  secret = await User.login(userData)
})

afterAll(async () => {
  await User.remove(u)
  db.server.close()
})

describe('register', () => {
  test('responds 401 to missing user', async () => {
    const { res, error } = await post(db.url)

    expect(error).toBe('missing auth token')
    expect(res.status).toBe(401)
  })

  test('responds 400 to invalid data', async () => {
    const { res, error } = await post(`${db.url}?secret=${secret}`)

    expect(error).toBe('missing comment data')
    expect(res.status).toBe(400)
  })

  test('creates comment when the data is correct', async () => {
    const { res, comment } = await post(
      `${db.url}?secret=${secret}`,
      commentData
    )

    expect(res.status).toBe(200)
    expect(comment.text).toBe(commentData.text)
    expect(comment.name).toBe(commentData.name)

    await Comment.remove(comment)
  })

  test('creates comment with parent', async () => {
    const { comment: parent } = await post(
      `${db.url}?secret=${secret}`,
      commentData
    )

    const { res, comment } = await post(`${db.url}?secret=${secret}`, {
      parent: parent.id,
      ...commentData,
    })

    expect(res.status).toBe(200)
    expect(comment.text).toBe(commentData.text)
    expect(comment.name).toBe(commentData.name)
    expect(comment.parent).toBe(parent.id)

    await Comment.remove(parent)
    await Comment.remove(comment)
  })
})
