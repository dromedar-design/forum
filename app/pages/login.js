import Router from 'next/router'
import { useState } from 'react'
import useAuth from '../utils/useAuth'

const Login = () => {
  const { login } = useAuth()
  const [data, setData] = useState({
    email: '',
    password: '',
  })

  return (
    <div>
      <form
        onSubmit={async event => {
          event.preventDefault()
          await login(data)
          Router.push('/')
        }}
      >
        <input
          type="email"
          name="email"
          value={data.email}
          onChange={event => setData({ ...data, email: event.target.value })}
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

Login.getInitialProps = async ({ req, res }) => {
  if (typeof window !== 'undefined') {
    return {}
  }

  // don't show login page for logged in users
  if (req.user) {
    res.redirect('/')
    res.end()
  }

  return {}
}

export default Login
