import { useState } from 'react'
import Input from '../components/Input'
import List from '../components/List'
import { get } from '../utils/useData'

const QUERY = '/comment/get'

const Home = () => {
  const [parent, setParent] = useState(null)

  return (
    <div>
      <Input parent={parent} setParent={setParent} />
      <List setParent={setParent} />
    </div>
  )
}

Home.getInitialProps = async ctx => {
  const data = await get(QUERY)

  return {
    left: {
      query: QUERY,
      initial: data,
    },
  }
}

export default Home
