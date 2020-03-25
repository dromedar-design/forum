if ('on' === process.env.MOCK) {
  jest.mock('@db/Model')
}

import { Comment } from '@db/Model'
import handler from '@pages/api/comment/delete'
import { post } from '@utils/http'
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

describe('delete comment', () => {
  test('shows error when id is missing', async () => {
    const { res, error } = await post(db.url)

    expect(res.status).toBe(400)
    expect(error).toBe('missing comment id')
  })

  test('shows error when comment is not available', async () => {
    const { res, error } = await post(db.url, {
      id: 999999,
    })

    expect(res.status).toBe(404)
    expect(error).toBe('instance not found')
  })

  test('succesfully removes comment', async () => {
    const data = { text: faker.lorem.sentence() }

    const comment = await Comment.create(data)

    const { res, current } = await post(db.url, {
      id: comment.id,
    })

    expect(res.status).toBe(200)
    expect(current.deleted).toBe(true)
    expect(current.text).toBe('')
    expect(typeof current._text).toBe('undefined')
  })
})
