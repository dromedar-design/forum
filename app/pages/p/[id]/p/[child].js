import { fetcher } from '../../../_app'

const QUERY = '/comment/get/'

const Post = ({ data }) => {
  return <div>temp</div>
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
