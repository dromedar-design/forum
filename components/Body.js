import Input from './Input'
import List from './List'

export default () => {
  return (
    <>
      <Input />
      <div className="flex">
        <List className="flex-1" side="left" />
        <List className="flex-1" side="right" />
      </div>
    </>
  )
}
