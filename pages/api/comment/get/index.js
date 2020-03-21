import { Comment } from '@db/Model'
import wrapper from '@db/wrapper'

export default async (req, res) =>
  wrapper(req, res, async req => {
    return {
      current: null,
      items: await Comment.all(),
    }
  })
