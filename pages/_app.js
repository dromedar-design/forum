import Layout from '@components/Layout'
import { get } from '@utils/http'
import { AuthProvider } from '@utils/useAuth'
import { DataProvider } from '@utils/useData'
import { SWRConfig } from 'swr'
import '../css/tailwind.css'

const MyApp = ({ Component, pageProps }) => {
  return (
    <SWRConfig value={{ fetcher: get }}>
      <AuthProvider initialUser={null}>
        <DataProvider left={pageProps.left} right={pageProps.right}>
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </DataProvider>
      </AuthProvider>
    </SWRConfig>
  )
}

export default MyApp
