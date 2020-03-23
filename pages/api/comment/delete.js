import { Comment } from '@db/Model'
import wrapper from '@db/wrapper'

export default async (req, res) =>
  wrapper(req, res, async req => {
    if (undefined === req.body.id) {
      throw new Error('missing comment id')
    }

    const comment = await Comment.find(req.body.id)

    const deleted = await Comment.update({
      ...comment,
      text: '',
      _text: comment.text,
      deleted: true,
    })

    return {
      current: deleted,
      items: [],
    }
  })
