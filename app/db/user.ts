import { query as q } from 'faunadb'
import { faunaClient, serverClient } from '../utils/fauna'

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

export const ref = (user: User) => {
  return q.Ref(q.Collection(COLLECTION), user.id)
}

export const transform = (response: faunaResponse): User => ({
  id: response.ref.id,
  ...response.data,
})

const withTransform = async (func: (arg: any) => any, data: any) => {
  return {
    user: transform(await func(data)),
  }
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

export const loginRaw = ({
  email,
  password,
}: RawUser): Promise<{ secret: string }> =>
  serverClient.query(
    q.Login(q.Match(q.Index(INDEX), email), {
      password,
    })
  )

export const login = async (data: RawUser) => (await loginRaw(data)).secret

export const getRaw = (secret: string) =>
  faunaClient(secret).query(q.Get(q.Identity()))

export const get = (secret: string) => withTransform(getRaw, secret)

export const remove = (user: User) => serverClient.query(q.Delete(ref(user)))
