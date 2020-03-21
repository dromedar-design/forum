import { request } from 'graphql-request'

const GET = `
  query getLikes($user: ID!, $comment: ID!) {
    allLikes(
      where: {
        AND: [
          { user: { id: $user } }
          { comment: { id: $comment } }
        ]
      }
    ) {
      id
    }
  }
`

const CREATE = `
  mutation createLike($user: ID!, $comment: ID!, $value: LikeValueType!) {
    createLike(
      data: {
        user: { connect: { id: $user } }
        comment: { connect: { id: $comment } }
        value: $value
      }
    ) {
      id
    }
  }
`

const UPDATE = `
  mutation updateLike($id: ID!, $value: LikeValueType!) {
    updateLike(
      id: $id,
      data: {
        value: $value
      }
    ) {
      id
    }
  }
`

export default async (req, res) => {
  if (!req.user) {
    return res.status(500).json({
      message: 'No user',
    })
  }

  let getData

  try {
    getData = await request('http://localhost:3000/admin/api', GET, {
      user: req.user.id,
      comment: req.body.comment,
    })
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    })
  }

  let postData
  const QUERY = getData.allLikes.length > 0 ? UPDATE : CREATE

  try {
    postData = await request('http://localhost:3000/admin/api', QUERY, {
      id: getData.allLikes[0]?.id,
      user: req.user.id,
      comment: req.body.comment,
      value: req.body.value,
    })
  } catch (e) {
    return res.status(500).json({
      message: e.message,
    })
  }

  res.status(200).json(postData)
}
