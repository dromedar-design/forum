import cookie from 'cookie'
import { query as q } from 'faunadb'
import { FAUNA_SECRET_COOKIE, serverClient } from '../../../utils/fauna-auth'
import { getUserRef } from '../user'

export default async (req, res) => {
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  if (!faunaSecret) {
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
    const response = await serverClient.query(
      q.Create(q.Collection('posts'), {
        data: {
          createdAt: q.Now(),
          user: q.Select(['id'], await getUserRef(faunaSecret)),
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
