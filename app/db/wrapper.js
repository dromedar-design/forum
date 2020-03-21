export default async (req, res, logic) => {
  try {
    const response = await logic(req)

    res.status(200).json(response)
  } catch (e) {
    // console.error(e)
    let status = 400

    if (e.requestResult?.statusCode) {
      status = e.requestResult?.statusCode
    }

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
