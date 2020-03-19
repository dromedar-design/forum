import { query as q } from 'faunadb'
import { ref as commentRef, transform } from '../../../db/comment'
import { get, getFromCookie, ref as userRef } from '../../../db/user'
import { serverClient } from '../../../utils/fauna'

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
    const { user } = await get(secret)

    const response = await serverClient.query(
      q.Create(q.Collection('comments'), {
        data: {
          createdAt: q.Now(),
          text: req.body.text,
          user: userRef(user),
          parent: req.body.parent ? commentRef({ id: req.body.parent }) : null,
        },
      })
    )

    res.status(200).json({
      comment: transform(response),
      items: [],
    })
  } catch (e) {
    console.log(e)

    res.status(e.requestResult.statusCode || 400).json({
      error: e.name,
      message: e.message,
    })
  }
}
