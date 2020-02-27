import { request } from 'graphql-request'

const WITH_PARENT = `
  mutation createComment($text: String!, $user: ID!, $parent: ID!) {
    createComment(data: { text: $text, user: { connect: { id: $user } }, parent: { connect: { id: $parent } } }) {
      id
      text
    }
  }
`

const NO_PARENT = `
  mutation createComment($text: String!, $user: ID!) {
    createComment(data: { text: $text, user: { connect: { id: $user } }}) {
      id
      text
    }
  }
`

export default async (req, res) => {
  if (!req.user) {
    return res.status(500).json({
      message: 'No user',
    })
  }

  const QUERY = req.body.parent ? WITH_PARENT : NO_PARENT
  let data

  try {
    data = await request('http://localhost:3000/admin/api', QUERY, {
      text: req.body.text,
      user: req.user.id,
      parent: req.body.parent,
    })
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    })
  }

  res.status(200).json(data)
}