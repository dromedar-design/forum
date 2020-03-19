import { query as q } from 'faunadb'
import { serverClient } from '../utils/fauna'

const COLLECTION = 'comments'
const INDEX = 'comments_by_parent'

interface Ref {
  id: string
  collection?: Ref
  class?: Ref
  database?: Ref
}

interface BaseComment {
  createdAt?: string
  text?: string
  user: Ref
  parent: Ref
}

export interface RawComment extends BaseComment {
  password: string
}

export interface Comment extends BaseComment {
  id: number
}

interface faunaResponse {
  ref: {
    id: number
  }
  data: BaseComment
}

export const ref = ({ id }: Comment) => q.Ref(q.Collection(COLLECTION), id)

export const transform = (response: faunaResponse): Comment => ({
  id: response.ref.id,
  ...response.data,
})

const withTransform = async (func: (arg: any) => any, data: any) => {
  return {
    current: transform(await func(data)),
    items: [],
  }
}

export const remove = (comment: Comment): void => {
  serverClient.query(q.Delete(ref(comment)))
}
