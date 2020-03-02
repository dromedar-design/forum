import { useEffect } from 'react'
import Body from '../components/Body'
import useData, { get } from '../utils/useData'

const QUERY = '/comment/get'

const Home = ({ right }) => {
  const { setRight, setLeft } = useData()

  useEffect(() => {
    setRight(right)
    setLeft()
  }, [right])

  return (
    <div>
      <Body />
    </div>
  )
}

Home.getInitialProps = async ctx => {
  const data = await get(QUERY)

  return {
    right: {
      query: QUERY,
      initial: data,
    },
  }
}

export default Home
