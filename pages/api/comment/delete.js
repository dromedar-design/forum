import { request } from 'graphql-request'

const QUERY = `
  mutation deleteComment($id: ID!) {
    deleteComment(id: $id) {
      id
    }
  }
`

export default async (req, res) => {
  let data

  try {
    data = await request('http://localhost:3000/admin/api', QUERY, {
      id: req.body.id,
    })
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    })
  }

  res.status(200).json(data)
}
