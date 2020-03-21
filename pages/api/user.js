import { getSecretFromRequest } from '@db/helpers'
import { User } from '@db/Model'
import wrapper from '@db/wrapper'

export default async (req, res) =>
  wrapper(req, res, async req => {
    const secret = getSecretFromRequest(req)

    return { user: await User.bySecret(secret) }
  })
