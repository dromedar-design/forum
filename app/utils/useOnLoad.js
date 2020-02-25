import { useEffect, useState } from 'react'

export default ({
  initial,
  onLoad = '',
  delay = 1,
  beforeOnLoad = () => null,
}) => {
  const [thing, setThing] = useState(initial)

  useEffect(() => {
    setTimeout(() => {
      beforeOnLoad()

      setThing(onLoad)
    }, delay)

    return () => setThing(initial)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return thing
}
