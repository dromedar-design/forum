import { ref as commentRef } from '../../../db/comment'
import { Comment, User } from '../../../db/Model'
import { getFromCookie } from '../../../db/user'

export default async (req, res) => {
  const secret = req.query.secret || getFromCookie(req)

  if (!secret) {
    return res.status(401).json({
      error: 'missing auth secret',
    })
  }

  if (!req.body.text) {
    return res.status(400).json({
      error: 'missing comment data',
    })
  }

  try {
    const user = await User.bySecret(secret)

    const comment = await Comment.create({
      createdAt: new Date().getTime(),
      text: req.body.text,
      user: User.ref(user),
      parent: req.body.parent ? commentRef({ id: req.body.parent }) : null,
    })

    // console.log(comment)

    res.status(200).json({ comment })
  } catch (e) {
    console.log(e)

    res.status(e.requestResult.statusCode || 400).json({
      error: e.name,
      message: e.message,
    })
  }
}
