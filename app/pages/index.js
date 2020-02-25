import Input from '../components/Input'
import List from '../components/List'
import { fetcher } from './_app'

const QUERY = '/get-comments'

const Home = ({ data }) => {
  return (
    <div>
      <Input query={QUERY} />
      <List initialData={data} query={QUERY} />
    </div>
  )
}

Home.getInitialProps = async ctx => {
  const data = await fetcher(QUERY)

  return { data }
}

export default Home
