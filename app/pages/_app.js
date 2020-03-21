import App from 'next/app'
import { SWRConfig } from 'swr'
import Layout from '../components/Layout'
import '../css/tailwind.css'
import { getSecretFromRequest } from '../db/helpers'
import { User } from '../db/Model'
import { get } from '../utils/http'
import { AuthProvider } from '../utils/useAuth'
import { DataProvider } from '../utils/useData'

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
    const { req } = appContext.ctx

    let user = null

    try {
      const secret = getSecretFromRequest(req)
      user = User.bySecret(secret)
    } catch (e) {
      console.error(e)
    }

    return {
      pageProps,
      user,
    }
  }

  return { pageProps }
}

export default MyApp
