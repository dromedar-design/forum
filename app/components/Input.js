import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import TextareaAutosize from 'react-textarea-autosize'
import useSWR, { trigger } from 'swr'

const Input = ({ query, parent }) => {
  const [text, setText] = useState('')
  const [isReady, setIsReady] = useState(false)
  const [showMarkdown, setShowMarkdown] = useState(false)
  const [height, setHeight] = useState(250)
  const inputEl = useRef(null)

  useSWR(
    () => (!isReady ? null : ['/api/comment/post', text]),
    (url, text) =>
      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, parent }),
      }),
    {
      onSuccess: () => {
        setIsReady(false)
        setText('')
        trigger(query)
      },
    }
  )

  return (
    <div className="fixed bottom-0 left-0 w-full">
      <motion.div
        className="p-4 rounded-t-lg bg-white shadow-input mx-auto w-input max-w-input flex flex-col"
        style={{ minHeight: height }}
        ref={inputEl}
        initial={{ y: height - 50 }}
        // animate={{ y: height - 50 }}
        drag="y"
        dragElastic={0.2}
        dragConstraints={{
          top: 0,
          bottom: height - 50,
        }}
      >
        <div className="absolute top-0 left-0 w-full mt-2">
          <hr className="w-40 mx-auto bg-gray-400 h-2 rounded-full opacity-50" />
        </div>

        <h2 className="mx-2 mt-1 sm:mt-0">Write your comment</h2>

        <form
          className="flex-1 flex flex-col mt-2"
          onSubmit={event => {
            event.preventDefault()
            if (!text) return
            setIsReady(true)
          }}
        >
          <div className="flex-1 border-t-2 border-gray-200">
            {showMarkdown ? (
              <ReactMarkdown className="dd-editor p-2 h-full" source={text} />
            ) : (
              <TextareaAutosize
                className="p-2 w-full resize-none max-h-screen"
                value={text}
                onChange={event => setText(event.target.value)}
                placeholder="Type here..."
                minRows={5}
                onHeightChange={() => {
                  setHeight(250)

                  setTimeout(() => {
                    if (!inputEl.current) return
                    setHeight(inputEl.current.offsetHeight)
                  }, 1)
                }}
              />
            )}
          </div>

          <div className="mt-4 flex justify-between">
            <button
              className="dd-button"
              onClick={e => {
                e.preventDefault()
                setShowMarkdown(!showMarkdown)
              }}
            >
              Toggle Markdown
            </button>
            <button disabled={!text} className="dd-button" type="submit">
              Go
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default Input
