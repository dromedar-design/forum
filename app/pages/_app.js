import App from 'next/app'
import { SWRConfig } from 'swr'
import Layout from '../components/Layout'
import '../css/tailwind.css'
import { AuthProvider } from '../utils/useAuth'

export const fetcher = url =>
  fetch(`http://localhost:3000/api${url}`).then(res => res.json())

const MyApp = ({ Component, pageProps, user }) => {
  return (
    <SWRConfig value={{ fetcher }}>
      <AuthProvider initialUser={user}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </AuthProvider>
    </SWRConfig>
  )
}

MyApp.getInitialProps = async appContext => {
  const { pageProps } = await App.getInitialProps(appContext)

  if (appContext.ctx.req && appContext.ctx.req.user) {
    return {
      pageProps,
      user: appContext.ctx.req.user,
    }
  }

  return { pageProps }
}

export default MyApp
