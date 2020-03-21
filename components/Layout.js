import Header from './Header'

const Layout = ({ children }) => {
  return (
    <div className="wrapper">
      <Header />
      <main>{children}</main>
    </div>
  )
}

export default Layout
