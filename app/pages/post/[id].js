import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import Input from '../../components/Input'
import List from '../../components/List'
import { fetcher } from '../_app'

const QUERY = '/comment/get/'

const Post = ({ data }) => {
  return (
    <div>
      <Input parent={data.current.id} query={QUERY + data.current.id} />

      <div style={{ marginTop: 20 }}>
        <Link
          href={data.current.parent ? `/post/${data.current.parent.id}` : '/'}
        >
          <a>Back</a>
        </Link>

        <div key={data.current.id}>
          <span style={{ marginRight: 10 }}>
            <ReactMarkdown source={data.current.text} />
          </span>
          {data.current.user && <small>by {data.current.user.name}</small>}
        </div>

        <List initialData={data} query={QUERY + data.current.id} />
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
