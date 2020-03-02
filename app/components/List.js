import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import useData from '../utils/useData'

const List = ({ query, initialData, setParent, ...props }) => {
  const { post, leftData: data } = useData()

  return !data ? (
    <p>Loading ...</p>
  ) : (
    <ul {...props}>
      {data.items.map(comment => {
        return (
          <li key={comment.id}>
            <span style={{ marginRight: 10 }}>
              <ReactMarkdown source={comment.text} />
            </span>
            {comment.user && (
              <small style={{ marginRight: 10 }}>by {comment.user.name}</small>
            )}
            <Link href="/p/[id]" as={`/p/${comment.id}`}>
              <a style={{ marginRight: 10 }}>Link</a>
            </Link>
            <button onClick={() => setParent(comment)}>Válasz</button>
            <span>[{comment.commentCount}]</span>
            <button
              onClick={() => {
                post('/comment/delete', {
                  id: comment.id,
                })
              }}
            >
              DEL
            </button>
            <button
              onClick={() => {
                post('/like/post', {
                  comment: comment.id,
                  value: 'UP',
                })
              }}
            >
              LIKE
            </button>
          </li>
        )
      })}
    </ul>
  )
}

export default List
