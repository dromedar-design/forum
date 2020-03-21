import useAuth from '@utils/useAuth'
import Router from 'next/router'
import { useEffect, useState } from 'react'

const Register = () => {
  const { register, isAuthenticated } = useAuth()
  const [data, setData] = useState({
    email: '',
    name: '',
    password: '',
  })

  useEffect(() => {
    if (isAuthenticated) {
      Router.push('/')
    }
  }, [isAuthenticated])

  return isAuthenticated ? (
    'Loading...'
  ) : (
    <div>
      <form
        onSubmit={event => {
          event.preventDefault()
          register(data)
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

export default Register
