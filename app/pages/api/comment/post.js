import { request } from 'graphql-request'

const WITH_PARENT = `
  mutation createComment($text: String!, $user: ID!, $parent: ID!) {
    createComment(data: {
      text: $text,
      user: { connect: { id: $user } },
      parent: { connect: { id: $parent } }
    }) {
      id
    }
  }
`

const NO_PARENT = `
  mutation createComment($text: String!, $user: ID!) {
    createComment(data: {
      text: $text,
      user: { connect: { id: $user } }
    }) {
      id
    }
  }
`

const BASEURL = 'http://localhost:3000/admin/api'

const process = async (res, query, variables = {}) => {
  let data

  try {
    data = await request(BASEURL, query, variables)
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    })
  }

  return data
}

export default async (req, res) => {
  if (!req.user) {
    return res.status(500).json({
      message: 'No user',
    })
  }

  const QUERY = req.body.parent ? WITH_PARENT : NO_PARENT

  const data = await process(res, QUERY, {
    text: req.body.text,
    user: req.user.id,
    parent: req.body.parent,
  })
  if (!data) return

  res.status(200).json(data)
}
