import { get, login, setCookie } from '../../db/user'

export default async (req, res) => {
  const { email, password } = await req.body

  try {
    if (!email || !password) {
      throw new Error('missing login data')
    }

    const secret = await login({ email, password })

    setCookie(secret, res)

    res.status(200).json(await get(secret))
  } catch (e) {
    let status = 400

    if (e.message === 'authentication failed') {
      status = 401
    }

    res.status(status).json({ error: e.message })
  }
}
