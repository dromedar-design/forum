import cookie from 'cookie'
import faunadb from 'faunadb'

export const FAUNA_SECRET_COOKIE = 'faunaSecret'

export const serverClient = new faunadb.Client({
  secret: process.env.FAUNA_SERVER_KEY,
})

export const faunaClient = secret =>
  new faunadb.Client({
    secret,
  })

export const serializeFaunaCookie = userSecret => {
  const cookieSerialized = cookie.serialize(FAUNA_SECRET_COOKIE, userSecret, {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 72576000,
    httpOnly: true,
    path: '/',
  })
  return cookieSerialized
}
