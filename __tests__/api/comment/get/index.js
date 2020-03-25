if ('on' === process.env.MOCK) {
  jest.mock('@db/Model')
}

import { Comment } from '@db/Model'
import handler from '@pages/api/comment/get/index'
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

describe('get all comments', () => {
  test('returns empty array when there is no comment', async () => {
    const { res, current, items } = await get(db.url)

    expect(res.status).toBe(200)
    expect(current).toBe(null)
    expect(items).toStrictEqual([])
  })

  test('returns one comment', async () => {
    const data = { text: faker.lorem.sentence() }

    await Comment.create(data)

    const { res, current, items } = await get(db.url)

    expect(res.status).toBe(200)
    expect(current).toBe(null)
    expect(items.length).toBe(1)
    expect(items[0].text).toBe(data.text)
  })

  test('returns all comments', async () => {
    const data1 = { text: faker.lorem.sentence() }
    const data2 = { text: faker.lorem.sentence() }

    await Comment.create(data1)
    await Comment.create(data2)

    const { res, current, items } = await get(db.url)

    expect(res.status).toBe(200)
    expect(current).toBe(null)
    expect(items.length).toBe(2)
    expect(items[0].text).toBe(data1.text)
    expect(items[1].text).toBe(data2.text)
  })
})
