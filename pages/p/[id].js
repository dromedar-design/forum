import Body from '@components/Body'
import { get } from '@utils/http'
import useData from '@utils/useData'
import Link from 'next/link'
import { useEffect } from 'react'

const QUERY = '/comment/get/'

const Post = ({ left, right }) => {
  const { setRight, setLeft, rightData: data } = useData()

  useEffect(() => {
    setRight(right)
    setLeft(left)
  }, [left, right])

  return (
    <div>
      {data && data.current && (
        <Link
          href={data.current.parent ? `/p/[id]` : '/'}
          as={data.current.parent ? `/p/${data.current.parent.id}` : '/'}
        >
          <a>Back</a>
        </Link>
      )}

      <Body />
    </div>
  )
}

Post.getInitialProps = async ctx => {
  const right = await get(QUERY + ctx.query.id)

  if (!right.current) {
    return ctx.res
      .status(404)
      .json({
        message: 'Can not be found a model with id: ' + ctx.query.id,
      })
      .end()
  }

  const leftQuery = right.current.parent
    ? QUERY + right.current.parent.id
    : '/comment/get'

  const left = await get(leftQuery)

  return {
    left: {
      query: leftQuery,
      initial: left,
    },
    right: {
      query: QUERY + ctx.query.id,
      initial: right,
    },
  }
}

export default Post
