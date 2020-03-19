import { query as q } from 'faunadb'
import { get, getFromCookie } from '../../../db/user'
import { serverClient } from '../../../utils/fauna'

export default async (req, res) => {
  const secret = req.query.secret || getFromCookie(req)

  if (!secret) {
    return res.status(401).json({
      error: 'No user',
    })
  }

  if (!req.body.text) {
    return res.status(400).json({
      error: 'Text is required',
    })
  }

  try {
    const { user } = await get(secret)

    const response = await serverClient.query(
      q.Create(q.Collection('posts'), {
        data: {
          createdAt: q.Now(),
          user: user.id,
          text: req.body.text,
          parent: req.body.parent,
        },
      })
    )

    res.status(200).json({
      response,
    })
  } catch (e) {
    console.log(e)

    res.status(e.requestResult.statusCode || 400).json({
      error: e.name,
      message: e.message,
    })
  }
}
