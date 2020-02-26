import Router from 'next/router'
import { useEffect, useState } from 'react'
import useAuth from '../utils/useAuth'

const Login = () => {
  const { login, isAuthenticated } = useAuth()
  const [data, setData] = useState({
    email: '',
    password: '',
  })

  useEffect(() => {
    if (isAuthenticated) {
      Router.push('/')
    }
  }, [isAuthenticated])

  return isAuthenticated ? (
    'Loading... '
  ) : (
    <div>
      <form
        onSubmit={async event => {
          event.preventDefault()
          login(data)
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

export default Login
