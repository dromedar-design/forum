import cookie from 'cookie'

const FAUNA_COOKIE_NAME = 'dd_secret'

export const getSecretFromRequest = req => {
  if (req.query.secret) {
    return req.query.secret
  }

  const cookies = cookie.parse(req.headers.cookie ?? '')

  const secret = cookies[FAUNA_COOKIE_NAME]

  if (!secret) {
    throw new Error('missing auth secret')
  }

  return secret
}
