import { NextApiRequest, NextApiResponse } from 'next-server/dist/lib/utils'
import { create, get, login, RawUser, setCookie } from '../../db/user'

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { email, password, name }: RawUser = await req.body

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
