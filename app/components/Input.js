import { motion } from 'framer-motion'
import { useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import TextareaAutosize from 'react-textarea-autosize'
import useAuth from '../utils/useAuth'
import useData from '../utils/useData'

const Input = ({ parent, setParent, defaultParentId }) => {
  const [text, setText] = useState('')
  const [showMarkdown, setShowMarkdown] = useState(false)
  const [height, setHeight] = useState(250)
  const inputEl = useRef(null)
  const { isAuthenticated } = useAuth()
  const { post } = useData()

  if (!isAuthenticated) return null

  return (
    <div className="fixed bottom-0 left-0 w-full">
      <div className="fixed inset-0 bg-black opacity-25 pointer-events-none"></div>
      <motion.div
        className="relative p-4 rounded-t-lg bg-white shadow-input mx-auto w-input max-w-input flex flex-col z-10"
        style={{ minHeight: height }}
        ref={inputEl}
        initial={{ y: height }}
        animate={{ y: height - 50 }}
        transition={{ damping: 30 }}
        drag="y"
        dragElastic={0.1}
        dragConstraints={{
          top: 0,
          bottom: height - 50,
        }}
      >
        <div className="absolute top-0 left-0 w-full mt-2">
          <hr className="w-40 mx-auto bg-gray-400 h-2 rounded-full opacity-50" />
        </div>

        <h2 className="mx-2 mt-1 sm:mt-0">
          <span>Write your comment</span>
          {parent && (
            <span>
              <span style={{ marginLeft: 20 }}>
                Válasz erre: {parent.text} - {parent.user.name}
              </span>
              <button
                onClick={() => setParent(null)}
                style={{ marginLeft: 20 }}
              >
                X Ne válaszoljon
              </button>
            </span>
          )}
        </h2>

        <form
          className="flex-1 flex flex-col mt-2"
          onSubmit={event => {
            event.preventDefault()
            if (!text) return

            post('/comment/post', {
              text,
              parent: parent ? parent.id : defaultParentId,
            }).then(() => {
              setText('')
              setParent(null)
            })
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
