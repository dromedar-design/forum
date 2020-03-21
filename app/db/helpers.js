import cookie from 'cookie'

if (process.env.NODE_ENV === 'test') {
  require('dotenv').config()
}

const COOKIE_NAME = 'dd_secret'

export const getSecretFromRequest = req => {
  if (req.query.secret) {
    return req.query.secret
  }

  const cookies = cookie.parse(req.headers.cookie ?? '')
  const secret = cookies[COOKIE_NAME]

  if (!secret) {
    throw new Error('missing auth token')
  }

  return secret
}

export const setCookie = (secret, res) => {
  const cookieSerialized = cookie.serialize(COOKIE_NAME, secret, {
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 72576000,
    httpOnly: true,
    path: '/',
  })

  res.setHeader('Set-Cookie', cookieSerialized)
}
