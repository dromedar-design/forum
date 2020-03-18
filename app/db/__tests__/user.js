import { createRaw } from '../user'

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
      email: 'email',
      password: 'password',
      name: 'name',
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
                "password": "password",
              },
            },
            "data": Object {
              "object": Object {
                "email": "email",
                "name": "name",
              },
            },
          },
        },
      }
    `)
  })
})
