import App from 'next/app'
import { SWRConfig } from 'swr'
import Layout from '../components/Layout'
import '../css/tailwind.css'
import { AuthProvider } from '../utils/useAuth'
import { DataProvider, get } from '../utils/useData'

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

  if (appContext.ctx.req && appContext.ctx.req.user) {
    return {
      pageProps,
      user: appContext.ctx.req.user,
    }
  }

  return { pageProps }
}

export default MyApp
