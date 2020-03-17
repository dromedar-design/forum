import http, { RequestListener } from 'http'
import { NextApiRequest, NextApiResponse } from 'next-server/dist/lib/utils'
import { apiResolver } from 'next-server/dist/server/api-utils'
import listen from 'test-listen'

type HandlerInterface = (req: NextApiRequest, res: NextApiResponse) => void

export const testServer = async (handler: HandlerInterface) => {
  const requestHandler: RequestListener = (req, res) => {
    const apiReq = req as NextApiRequest
    const apiRes = res as NextApiResponse
    return apiResolver(apiReq, apiRes, undefined, handler)
  }
  const server = http.createServer(requestHandler)
  const url = await listen(server)

  return { server, url }
}
