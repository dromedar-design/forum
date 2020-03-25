if ('on' === process.env.MOCK) {
  jest.mock('@db/Model')
}

import { Comment } from '@db/Model'
import handler from '@pages/api/comment/get/[id]'
import { get } from '@utils/http'
import { testServer } from '@utils/testing'
import faker from 'faker'

let db

beforeEach(async () => await Comment.reset())

beforeAll(async () => {
  db = await testServer(handler)
})

afterAll(async () => {
  db.server.close()
})

describe('get comment by id', () => {
  test('returns error when id is missing', async () => {
    const { res, error } = await get(db.url)

    expect(res.status).toBe(400)
    expect(error).toBe('missing comment id')
  })

  test('returns error when comment is not available', async () => {
    const { res, error } = await get(db.url, {
      id: 999999,
    })

    expect(res.status).toBe(404)
    expect(error).toBe('instance not found')
  })

  test('returns one comment with no children', async () => {
    const data = { text: faker.lorem.sentence() }

    const comment = await Comment.create(data)

    const { res, current, items } = await get(db.url, {
      id: comment.id,
    })

    expect(res.status).toBe(200)
    expect(current.text).toBe(comment.text)
    expect(current.text).toBe(data.text)
    expect(items.length).toBe(0)
  })

  test('returns one comment with children', async () => {
    const data1 = { text: faker.lorem.sentence() }
    const data2 = { text: faker.lorem.sentence() }

    const comment1 = await Comment.create(data1)
    const comment2 = await Comment.create({
      ...data2,
      parent: Comment.ref(comment1),
    })

    const { res, current, items } = await get(db.url, {
      id: comment1.id,
    })

    expect(res.status).toBe(200)
    expect(current.text).toBe(comment1.text)
    expect(current.text).toBe(data1.text)
    expect(items.length).toBe(1)
    expect(items[0].text).toBe(comment2.text)
    expect(items[0].text).toBe(data2.text)
    expect(items[0].parent.id).toBe(comment1.id)
  })
})
