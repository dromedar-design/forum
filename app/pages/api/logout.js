import { getSecretFromRequest, setCookie } from '../../db/helpers'
import { User } from '../../db/Model'
import wrapper from '../../db/wrapper'

export default async (req, res) =>
  wrapper(req, res, async (req, res) => {
    const secret = getSecretFromRequest(req)
    await User.logout(secret)

    setCookie('', res)

    return {}
  })
