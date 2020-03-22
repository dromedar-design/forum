import useAuth from '@utils/useAuth'
import Link from 'next/link'
import Router from 'next/router'
import React from 'react'

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
            <span>{user.name}</span>
            <span>{user.email}</span>
          </>
        )}
      </nav>
    </header>
  )
}

export default Header
