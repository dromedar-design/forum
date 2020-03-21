import useData from '@utils/useData'
import Link from 'next/link'
import ReactMarkdown from 'react-markdown'

const List = ({ side, ...props }) => {
  const { post, getSide, rightData, setSelected } = useData()
  const data = getSide(side)

  return !data || !data.items ? (
    <p>Loading ...</p>
  ) : (
    <ul {...props}>
      {data.items.map(comment => {
        return (
          <li
            key={comment.id}
            className={
              rightData &&
              rightData.current &&
              rightData.current.id === comment.id
                ? 'bg-red-500'
                : ''
            }
          >
            <span style={{ marginRight: 10 }}>
              <ReactMarkdown source={comment.text} />
            </span>
            {comment.user && (
              <small style={{ marginRight: 10 }}>by {comment.user.name}</small>
            )}
            <Link href="/p/[id]" as={`/p/${comment.id}`}>
              <a style={{ marginRight: 10 }}>Link</a>
            </Link>
            <button onClick={() => setSelected(comment)}>Válasz</button>
            <span>[{comment.commentCount}]</span>
            <button
              onClick={() => {
                post('/comment/delete', {
                  ref: comment.id,
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
