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
  console.log(req.user, req.body.text)

  const QUERY = req.body.parent ? WITH_PARENT : NO_PARENT
  let data

  try {
    data = await request('http://localhost:3000/admin/api', QUERY, {
      text: req.body.text,
      user: req.user.id,
      parent: req.body.parent,
    })
  } catch (err) {
    res.statusCode = 500
    res.end(err.message)
    return
  }

  res.statusCode = 200
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(data))
}
