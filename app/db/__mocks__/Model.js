let DB = []

const cleanDB = () => DB.map(({ password, secret, ...data }) => data)

export const User = {
  reset: () => (DB = []),
  create: data => {
    const attrs = {}

    for (const key in data) {
      if (data[key].indexOf('@ref=') !== -1) {
        attrs[key] = data[key].replace('@ref=', '')
      } else {
        attrs[key] = data[key]
      }
    }

    const item = {
      id: String(Math.round(Math.random() * 999999999)),
      ...attrs,
    }

    DB.push(item)

    const { secret, password, ...secure } = item
    return secure
  },
  all: () => cleanDB(),
  remove: data => {
    DB = DB.filter(item => item.id !== data.id)
    return true
  },
  where: (key, value) => cleanDB().filter(item => item[key] === value),
  find: id => cleanDB().find(item => item.id === id),
  login: ({ email, password }) => {
    const item = DB.find(item => item.email === email)
    if (!item) return null

    if (item.password !== password) {
      throw new Error('unauthorized')
    }

    const secret = String(new Date().getTime())
    DB = DB.map(item => {
      if (item.email === email) {
        item.secret = secret
      }

      return item
    })

    return secret
  },
  bySecret: secret => {
    const item = DB.find(item => item.secret === secret)
    if (!item) {
      throw new Error('unauthorized')
    }

    const { secret: s, password, ...secure } = item
    return secure
  },
  ref: ({ id }) => `@ref=${id}`,
}
