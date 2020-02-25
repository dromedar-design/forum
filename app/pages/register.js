import { useState } from 'react'

// const CREATE_USER = gql`
//   mutation createUser($email: String!, $name: String!, $password: String!) {
//     createUser(data: { email: $email, name: $name, password: $password }) {
//       id
//       name
//     }
//   }
// `

const Register = () => {
  const [data, setData] = useState({
    email: '',
    name: '',
    password: '',
  })

  return (
    <div>
      <form
        onSubmit={event => {
          event.preventDefault()

          createUser({ variables: data })
        }}
      >
        <input
          type="email"
          name="email"
          value={data.email}
          onChange={event => setData({ ...data, email: event.target.value })}
        />
        <input
          type="text"
          name="name"
          value={data.name}
          onChange={event => setData({ ...data, name: event.target.value })}
        />
        <input
          type="password"
          name="password"
          value={data.password}
          onChange={event => setData({ ...data, password: event.target.value })}
        />
        <button type="submit">Go</button>
      </form>
    </div>
  )
}

Register.getInitialProps = async ({ req, res }) => {
  if (typeof window !== 'undefined') return {}

  // don't show register page for logged in users
  if (req.user) {
    res.redirect('/')
    res.end()
    return {}
  }

  return {}
}

export default Register
