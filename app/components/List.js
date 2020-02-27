import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import useSWR, { trigger } from 'swr'
import { fetcher } from '../pages/_app'

const List = ({ initialData, query, setParent }) => {
  const { data } = useSWR(query, { initialData })

  return !data ? (
    <p>Loading ...</p>
  ) : (
    <ul>
      {data.items.map(comment => {
        return (
          <li key={comment.id}>
            <span style={{ marginRight: 10 }}>
              <ReactMarkdown source={comment.text} />
            </span>
            {comment.user && (
              <small style={{ marginRight: 10 }}>by {comment.user.name}</small>
            )}
            <Link href="/post/[id]" as={`/post/${comment.id}`}>
              <a style={{ marginRight: 10 }}>Link</a>
            </Link>
            <button onClick={() => setParent(comment)}>Válasz</button>
            <span>[{comment.commentCount}]</span>
            <button
              onClick={() => {
                fetcher('/comment/delete', {
                  id: comment.id,
                }).then(() => {
                  trigger(query)
                })
              }}
            >
              DEL
            </button>
            <button
              onClick={() => {
                fetcher('/like/post', {
                  comment: comment.id,
                  value: 'UP',
                }).then(() => {
                  trigger(query)
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
