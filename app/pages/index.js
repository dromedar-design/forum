import { useState } from 'react'
import Input from '../components/Input'
import List from '../components/List'
import { fetcher } from './_app'

const QUERY = '/comment/get'

const Home = ({ data }) => {
  const [parent, setParent] = useState(null)

  return (
    <div>
      <Input query={QUERY} parent={parent} setParent={setParent} />
      <List initialData={data} query={QUERY} setParent={setParent} />
    </div>
  )
}

Home.getInitialProps = async ctx => {
  const data = await fetcher(QUERY)

  return { data }
}

export default Home
