import { getSecretFromRequest } from '@db/helpers'
import { Comment, User } from '@db/Model'
import wrapper from '@db/wrapper'

export default async (req, res) =>
  wrapper(req, res, async req => {
    const secret = getSecretFromRequest(req)

    if (!req.body.text) {
      throw new Error('missing comment data')
    }

    const user = await User.bySecret(secret)

    let comment = await Comment.create({
      createdAt: new Date().getTime(),
      text: req.body.text,
      user: User.ref(user),
      parent: req.body.parent ? Comment.ref({ id: req.body.parent }) : null,
      deleted: false,
      commentCount: 0,
    })

    if (comment.parent) {
      const parent = await Comment.update({
        id: comment.parent.id,
        commentCount: comment.parent.commentCount + 1,
      })

      comment = { ...comment, parent }
    }

    return { code: 201, comment }
  })
