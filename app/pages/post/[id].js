import Link from 'next/link'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import Input from '../../components/Input'
import List from '../../components/List'
import { fetcher } from '../_app'

const QUERY = '/comment/get/'

const Post = ({ data }) => {
  const [parent, setParent] = useState(null)

  return (
    <div>
      <Input
        query={QUERY + data.current.id}
        defaultParentId={data.current.id}
        parent={parent}
        setParent={setParent}
      />

      <div style={{ marginTop: 20 }}>
        <Link
          href={data.current.parent ? `/post/[id]` : '/'}
          as={data.current.parent ? `/post/${data.current.parent.id}` : '/'}
        >
          <a>Back</a>
        </Link>

        <div key={data.current.id}>
          <span style={{ marginRight: 10 }}>
            <ReactMarkdown source={data.current.text} />
          </span>
          {data.current.user && <small>by {data.current.user.name}</small>}
        </div>

        <List
          initialData={data}
          query={QUERY + data.current.id}
          setParent={setParent}
        />
      </div>
    </div>
  )
}

Post.getInitialProps = async ctx => {
  const data = await fetcher(QUERY + ctx.query.id)

  if (!data.current) {
    ctx.res
      .status(404)
      .json({
        message: 'Can not be found a model with id: ' + ctx.query.id,
      })
      .end()
  }

  return { data }
}

export default Post
