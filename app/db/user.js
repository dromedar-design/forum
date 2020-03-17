import cookie from 'cookie'
import { query as q } from 'faunadb'
import {
  faunaClient,
  FAUNA_SECRET_COOKIE,
  serializeFaunaCookie,
  serverClient,
} from '../utils/fauna-auth'

const COLLECTION = 'users'
const INDEX = 'users_by_email'

export const ref = id => q.Ref(q.Collection(COLLECTION), id)

export const transform = response => ({ id: response.ref.id, ...response.data })

export const setCookie = (secret, res) => {
  if (!secret) {
    throw new Error('invalid secret')
  }

  const cookieSerialized = serializeFaunaCookie(secret)
  res.setHeader('Set-Cookie', cookieSerialized)
}

export const getFromCookie = req => {
  const cookies = cookie.parse(req.headers.cookie ?? '')
  return cookies[FAUNA_SECRET_COOKIE]
}

export const create = async ({ email, password, ...data }) => ({
  user: transform(
    await serverClient.query(
      q.Create(q.Collection(COLLECTION), {
        credentials: { password },
        data: { email, ...data },
      })
    )
  ),
})

export const login = async ({ email, password }) => {
  const response = await serverClient.query(
    q.Login(q.Match(q.Index(INDEX), email), {
      password,
    })
  )

  return response.secret
}

export const get = async secret => ({
  user: transform(await faunaClient(secret).query(q.Get(q.Identity()))),
})

export const remove = async ({ id }) =>
  await serverClient.query(q.Delete(ref(id)))
