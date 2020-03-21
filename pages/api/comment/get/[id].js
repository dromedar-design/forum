import { Comment } from '@db/Model'
import wrapper from '@db/wrapper'

export default async (req, res) =>
  wrapper(req, res, async req => {
    if (undefined === req.query.id) {
      throw new Error('missing comment id')
    }

    return {
      current: await Comment.find(req.query.id),
      items: await Comment.where(['parent', Comment.ref({ id: req.query.id })]),
    }
  })
