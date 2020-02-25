import Link from 'next/link'

const Header = ({ user }) => {
  console.log(user)

  return (
    <header>
      <Link href="/">
        <a>Logo</a>
      </Link>
      <Link href="/dashboard">
        <a>Dash</a>
      </Link>

      <nav>
        {!user && (
          <Link href="/login">
            <a>Login</a>
          </Link>
        )}
        {!user && (
          <Link href="/register">
            <a>Register</a>
          </Link>
        )}
        {user && <button onClick={() => logout()}>Logout</button>}
      </nav>
    </header>
  )
}

export default Header
