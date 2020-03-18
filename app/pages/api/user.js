import { get, getFromCookie } from '../../db/user'

export default async (req, res) => {
  try {
    const secret = req.query.secret || getFromCookie(req)

    if (!secret) {
      throw new Error('missing auth secret')
    }

    res.status(200).json(await get(secret))
  } catch (e) {
    let status = 400

    if (
      e.message === 'unauthorized' ||
      e.message === 'authentication failed' ||
      e.message === 'missing auth secret'
    ) {
      status = 401
    }

    res.status(status).json({ error: e.message })
  }
}
