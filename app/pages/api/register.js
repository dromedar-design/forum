import { create, get, login, setCookie } from '../../db/user'

export default async (req, res) => {
  const { email, password, name } = await req.body

  try {
    if (!email || !password || !name) {
      throw new Error('missing register data')
    }

    await create({ email, password, name })
    const secret = await login({ email, password })

    setCookie(secret, res)

    res.status(200).json(await get(secret))
  } catch (e) {
    res.status(400).json({ error: e.message })
  }
}
