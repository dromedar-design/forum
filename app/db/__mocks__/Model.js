let DB = []

const cleanDB = () => DB.map(({ password, secret, ...data }) => data)

const randomString = () => String(Math.round(Math.random() * 999999999))

const Model = {
  reset: () => (DB = []),
  create: data => {
    const attrs = {}

    for (const key in data) {
      if (typeof data[key] === 'string' && data[key].indexOf('@ref=') !== -1) {
        attrs[key] = data[key].replace('@ref=', '')
      } else {
        attrs[key] = data[key]
      }
    }

    const item = {
      id: randomString(),
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
  login: data => {
    if (!data || !data.password || !data.email) {
      throw new Error('invalid login data')
    }

    const item = DB.find(item => item.email === data.email)
    if (!item) {
      throw new Error('authentication failed')
    }

    if (item.password !== data.password) {
      throw new Error('authentication failed')
    }

    const secret = randomString()
    DB = DB.map(item => {
      if (item.email === data.email) {
        item.secret = secret
      }

      return item
    })

    return secret
  },
  bySecret: secret => {
    if (!secret || typeof secret !== 'string') {
      throw new Error('invalid auth token')
    }

    const item = DB.find(item => item.secret === secret)
    if (!item) {
      throw new Error('unauthorized')
    }

    const { secret: s, password, ...secure } = item
    return secure
  },
  ref: ({ id }) => `@ref=${id}`,
  logout: secret => {
    if (!secret || typeof secret !== 'string') {
      throw new Error('invalid auth token')
    }

    const item = DB.find(item => item.secret === secret)
    if (!item) {
      throw new Error('unauthorized')
    }

    DB = DB.filter(i => i.id !== item.id)
    return true
  },
}

export const User = Model
export const Comment = Model
