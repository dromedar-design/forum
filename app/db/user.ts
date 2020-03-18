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

interface faunaResponse {
  ref: {
    id: number
  }
  data: BaseUser
}

export const ref = (id: number) => q.Ref(q.Collection(COLLECTION), id)

export const transform = (response: faunaResponse): User => ({
  id: response.ref.id,
  ...response.data,
})

const withTransform = async (
  func: (user: RawUser) => Promise<faunaResponse>,
  data: RawUser
) => {
  return {
    user: transform(await func(data)),
  }
}

export const setCookie = (secret: string, res: NextApiResponse) => {
  const cookieSerialized = serializeFaunaCookie(secret)
  res.setHeader('Set-Cookie', cookieSerialized)
}

export const getFromCookie = (req: NextApiRequest): string => {
  const cookies = cookie.parse(req.headers.cookie ?? '')
  return cookies[FAUNA_SECRET_COOKIE]
}

export const createRaw = ({
  password,
  ...data
}: RawUser): Promise<faunaResponse> =>
  serverClient.query(
    q.Create(q.Collection(COLLECTION), {
      credentials: { password },
      data: { ...data },
    })
  )

export const create = (data: RawUser) => withTransform(createRaw, data)

export const login = async ({ email, password }: RawUser) => {
  const { secret } = await serverClient.query(
    q.Login(q.Match(q.Index(INDEX), email), {
      password,
    })
  )

  return secret
}

export const get = async (secret: string) => ({
  user: transform(await faunaClient(secret).query(q.Get(q.Identity()))),
})

export const remove = async ({ id }: User) =>
  await serverClient.query(q.Delete(ref(id)))
