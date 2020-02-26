import { request } from 'graphql-request'

const QUERY = `
  query {
    allComments(where: { parent_is_null: true }) {
      id
      text
      commentCount
      user {
        name
      }
    }
  }
`

export default async (req, res) => {
  let data

  try {
    data = await request('http://localhost:3000/admin/api', QUERY)
  } catch (e) {
    res.status(500).json({
      message: e.message,
    })
  }

  res.status(200).json({
    items: data.allComments.sort((a, b) => b.commentCount - a.commentCount),
  })
}
