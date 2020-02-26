import Link from 'next/link'
import Router from 'next/router'
import useAuth from '../utils/useAuth'

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth()

  return (
    <header>
      <Link href="/">
        <a>Logo</a>
      </Link>
      <Link href="/dashboard">
        <a>Dash</a>
      </Link>

      <nav>
        {!isAuthenticated && (
          <>
            <Link href="/login">
              <a>Login</a>
            </Link>
            <Link href="/register">
              <a>Register</a>
            </Link>
          </>
        )}

        {isAuthenticated && (
          <>
            <button
              onClick={async () => {
                await logout()
                Router.push('/')
              }}
            >
              Logout
            </button>
            {user.name}
            {user.email}
          </>
        )}
      </nav>
    </header>
  )
}

export default Header
