import cookie from 'cookie'
import { query as q } from 'faunadb'
import { NextApiRequest, NextApiResponse } from 'next-server/dist/lib/utils'
import {
  faunaClient,
  FAUNA_SECRET_COOKIE,
  serializeFaunaCookie,
  serverClient,
} from '../utils/fauna'

const COLLECTION = 'users'
const INDEX = 'users_by_email'

interface BaseUser {
  email: string
  name?: string
}

export interface RawUser extends BaseUser {
  password: string
}

export interface User extends BaseUser {
  id: number
}

export const ref = (id: number) => q.Ref(q.Collection(COLLECTION), id)

export const transform = (response: {
  ref: {
    id: number
  }
  data: BaseUser
}): User => ({
  id: response.ref.id,
  ...response.data,
})

export const setCookie = (secret: string, res: NextApiResponse) => {
  if (!secret) {
    throw new Error('invalid secret')
  }

  const cookieSerialized = serializeFaunaCookie(secret)
  res.setHeader('Set-Cookie', cookieSerialized)
}

export const getFromCookie = (req: NextApiRequest): string => {
  const cookies = cookie.parse(req.headers.cookie ?? '')
  return cookies[FAUNA_SECRET_COOKIE]
}

export const create = async ({ password, ...data }: RawUser) => ({
  user: transform(
    await serverClient.query(
      q.Create(q.Collection(COLLECTION), {
        credentials: { password },
        data: { ...data },
      })
    )
  ),
})

export const login = async ({ email, password }: RawUser) => {
  const { secret } = await serverClient.query(
    q.Login(q.Match(q.Index(INDEX), email), {
      password,
    })
  )

  if (!secret) {
    throw new Error('invalid secret')
  }

  return secret
}

export const get = async (secret: string) => ({
  user: transform(await faunaClient(secret).query(q.Get(q.Identity()))),
})

export const remove = async ({ id }: User) =>
  await serverClient.query(q.Delete(ref(id)))
