import { setCookie } from '../../db/helpers'
import { User } from '../../db/Model'
import wrapper from '../../db/wrapper'

export default async (req, res) =>
  wrapper(req, res, async (req, res) => {
    const { email, password } = await req.body

    if (!email || !password) {
      throw new Error('missing login data')
    }

    const secret = await User.login({ email, password })
    setCookie(secret, res)

    return {
      user: await User.bySecret(secret),
    }
  })
