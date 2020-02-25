import Header from './Header'

const Layout = ({ user, children }) => {
  return (
    <div className="wrapper">
      <Header user={user} />
      <main>{children}</main>
    </div>
  )
}

export default Layout
