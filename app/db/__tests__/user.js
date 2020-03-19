import { createRaw, getRaw, loginRaw, remove } from '../user'

if (process.env.NODE_ENV === 'test') {
  require('dotenv').config()
}

jest.mock('faunadb', () => {
  const fauna = require.requireActual('faunadb')

  return {
    query: fauna.query,
    Client: function() {
      return {
        query: expr => expr,
      }
    },
  }
})

afterAll(() => {
  jest.unmock('faunadb')
})

describe('user model', () => {
  test('creating a new user is possible', async () => {
    const resp = await createRaw({
      email: 'custom@mail.com',
      password: 'superSecret',
      name: 'thisIsMyName',
    })

    expect(resp).toMatchInlineSnapshot(`
      Object {
        "create": Object {
          "collection": "users",
        },
        "params": Object {
          "object": Object {
            "credentials": Object {
              "object": Object {
                "password": "superSecret",
              },
            },
            "data": Object {
              "object": Object {
                "email": "custom@mail.com",
                "name": "thisIsMyName",
              },
            },
          },
        },
      }
    `)
  })

  test('logging in is possible', async () => {
    const resp = await loginRaw({
      email: 'custom@mail.com',
      password: 'superSecret',
    })

    expect(resp).toMatchInlineSnapshot(`
      Object {
        "login": Object {
          "match": Object {
            "index": "users_by_email",
          },
          "terms": "custom@mail.com",
        },
        "params": Object {
          "object": Object {
            "password": "superSecret",
          },
        },
      }
    `)
  })

  test('getting a logged in user is possible', async () => {
    const resp = await getRaw(process.env.FAUNA_TEST_KEY)

    expect(resp).toMatchInlineSnapshot(`
Object {
  "get": Object {
    "identity": null,
  },
}
`)
  })

  test('deleting a user is possible', async () => {
    const resp = await remove({
      id: 12345678,
    })

    expect(resp).toMatchInlineSnapshot(`
      Object {
        "delete": Object {
          "id": 12345678,
          "ref": Object {
            "collection": "users",
          },
        },
      }
    `)
  })
})
