import { query as q } from 'faunadb'
import { serializeFaunaCookie, serverClient } from '../../utils/fauna-auth'
import { getUser } from './user'

export default async (req, res) => {
  const { email, password, name } = await req.body

  try {
    if (!email || !password || !name) {
      throw new Error('Email and password and name must be provided.')
    }
    console.log(`email: ${email} trying to create user.`)

    let user

    try {
      user = await serverClient.query(
        q.Create(q.Collection('User'), {
          credentials: { password },
          data: { email, name },
        })
      )
    } catch (error) {
      console.error('Fauna create user error:', error)
      throw new Error('User already exists.')
    }

    if (!user.ref) {
      throw new Error('No ref present in create query response.')
    }

    const loginRes = await serverClient.query(
      q.Login(user.ref, {
        password,
      })
    )

    if (!loginRes.secret) {
      throw new Error('No secret present in login query response.')
    }

    const cookieSerialized = serializeFaunaCookie(loginRes.secret)

    res.setHeader('Set-Cookie', cookieSerialized)

    res.status(200).json({
      user: await getUser(loginRes.secret),
    })
  } catch (e) {
    res.status(400).send({
      error: e.message,
    })
  }
}
