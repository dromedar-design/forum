export default async (req, res, logic) => {
  try {
    const { code = 200, ...response } = await logic(req, res)

    res.status(code).json(response)
  } catch (e) {
    // console.error(e)
    let status = 400

    if (e.requestResult?.statusCode) {
      status = e.requestResult.statusCode
    }

    if (
      [
        'unauthorized',
        'authentication failed',
        'missing auth token',
        'invalid auth token',
      ].includes(e.message)
    ) {
      status = 401
    }

    res.status(status).json({ error: e.message })
  }
}
