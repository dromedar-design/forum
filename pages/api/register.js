import { User } from '@db/Model'
import wrapper from '@db/wrapper'

export default async (req, res) =>
  wrapper(req, res, async req => {
    const { email, password, name } = await req.body

    if (!email || !password || !name) {
      throw new Error('missing register data')
    }

    const user = await User.create({ email, password, name })

    return { code: 201, user }
  })
