import { request } from 'graphql-request'

const QUERY = `
  query getComments ($id: ID!) {
    Comment(where: { id: $id }) {
      id
      text
      user {
        name
      }
      parent {
        id
      }
    }
    allComments(where: { parent: { id: $id } }, orderBy: "position_DESC") {
      id
      text
      commentCount
      likeCount
      position
      user {
        name
      }
    }
  }  
`

export default async (req, res) => {
  let data

  try {
    data = await request('http://localhost:3000/admin/api', QUERY, {
      id: req.query.id,
    })
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    })
  }

  res.status(200).json({
    current: data.Comment,
    items: data.allComments,
  })
}
