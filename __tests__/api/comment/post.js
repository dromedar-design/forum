if ('on' === process.env.MOCK) {
  jest.mock('@db/Model')
}

import { Comment, User } from '@db/Model'
import handler from '@pages/api/comment/post'
import { post } from '@utils/http'
import { testServer } from '@utils/testing'
import faker from 'faker'

let db, u, secret
const userData = {
  email: faker.internet.email(),
  password: faker.internet.password(),
}
const commentData = {
  text: faker.lorem.sentence(),
}

beforeEach(async () => await Comment.reset())

beforeAll(async () => {
  db = await testServer(handler)
  u = await User.create(userData)
  secret = await User.login(userData)
})

afterAll(async () => {
  User.remove(u)
  db.server.close()
})

describe('create comment', () => {
  test('responds 401 to missing user', async () => {
    const { res, error } = await post(db.url)

    expect(res.status).toBe(401)
    expect(error).toBe('missing auth token')
  })

  test('responds 400 to invalid data', async () => {
    const { res, error } = await post(`${db.url}?secret=${secret}`)

    expect(res.status).toBe(400)
    expect(error).toBe('missing comment data')
  })

  test('creates comment when the data is correct', async () => {
    const { res, comment } = await post(
      `${db.url}?secret=${secret}`,
      commentData
    )

    expect(res.status).toBe(201)
    expect(comment.text).toBe(commentData.text)
    expect(comment.name).toBe(commentData.name)
  })

  test('creates comment with parent', async () => {
    const { comment: parent } = await post(
      `${db.url}?secret=${secret}`,
      commentData
    )

    expect(parent.commentCount).toBe(0)

    const { res, comment } = await post(`${db.url}?secret=${secret}`, {
      parent: parent.id,
      ...commentData,
    })

    expect(res.status).toBe(201)
    expect(comment.text).toBe(commentData.text)
    expect(comment.name).toBe(commentData.name)
    expect(comment.parent.id).toBe(parent.id)
    expect(comment.parent.commentCount).toBe(1)
  })
})
