import Layout from '@components/Layout'
import { getSecretFromRequest } from '@db/helpers'
import { get } from '@utils/http'
import { AuthProvider } from '@utils/useAuth'
import { DataProvider } from '@utils/useData'
import App from 'next/app'
import { SWRConfig } from 'swr'
import '../css/tailwind.css'

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

    const response = await get('/user')
    console.log(response, getSecretFromRequest(req))
    if (response.user) {
      user = response.user
    }

    return {
      pageProps,
      user,
    }
  }

  return { pageProps }
}

export default MyApp
