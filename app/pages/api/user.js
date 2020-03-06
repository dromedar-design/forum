import cookie from 'cookie'
import { query as q } from 'faunadb'
import { faunaClient, FAUNA_SECRET_COOKIE } from '../../utils/fauna-auth'

export const getUserRef = async faunaSecret =>
  await faunaClient(faunaSecret).query(q.Identity())

export const getUser = async faunaSecret => {
  const ref = await getUserRef(faunaSecret)

  const { id, item } = await faunaClient(faunaSecret).query({
    id: q.Select(['id'], ref),
    item: q.Get(ref),
  })

  return {
    id,
    ...item.data,
  }
}

export default async (req, res) => {
  const cookies = cookie.parse(req.headers.cookie ?? '')
  const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

  if (!faunaSecret) {
    return res.status(401).json({
      error: 'Auth cookie missing.',
    })
  }

  res.status(200).json({ user: await getUser(faunaSecret) })
}
