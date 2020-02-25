import Link from 'next/link'
import ReactMarkdown from 'react-markdown'
import useSWR from 'swr'

const List = ({ initialData, query }) => {
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
            <Link href={`/post/${comment.id}`}>
              <a style={{ marginRight: 10 }}>Link</a>
            </Link>
            [{comment.commentCount}]
          </li>
        )
      })}
    </ul>
  )
}

export default List
