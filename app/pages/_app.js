import cookie from 'cookie'
import App from 'next/app'
import { SWRConfig } from 'swr'
import Layout from '../components/Layout'
import '../css/tailwind.css'
import { FAUNA_SECRET_COOKIE } from '../utils/fauna'
import { get } from '../utils/http'
import { AuthProvider } from '../utils/useAuth'
import { DataProvider } from '../utils/useData'
import { getUser } from './api/user'

const MyApp = ({ Component, pageProps, user }) => {
  return (
    <SWRConfig value={{ fetcher: get }}>
      <AuthProvider initialUser={user}>
        <DataProvider left={pageProps.left} right={pageProps.right}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </DataProvider>
      </AuthProvider>
    </SWRConfig>
  )
}

MyApp.getInitialProps = async appContext => {
  const { pageProps } = await App.getInitialProps(appContext)

  if (typeof window === 'undefined') {
    const { req, res } = appContext.ctx
    const cookies = cookie.parse(req.headers.cookie ?? '')
    const faunaSecret = cookies[FAUNA_SECRET_COOKIE]

    if (!faunaSecret) {
      return { pageProps }
    }

    const user = await getUser(faunaSecret)

    if (!user) {
      return { pageProps, user: null }
    }

    return {
      pageProps,
      user,
    }
  }

  return { pageProps }
}

export default MyApp
