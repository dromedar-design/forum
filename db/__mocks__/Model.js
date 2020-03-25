let DB = []

const cleanDB = () =>
  DB.map(({ password, secret, ...data }) => {
    const attrs = {}

    for (const key in data) {
      if (0 === key.indexOf('_')) {
        continue
      }

      if (typeof data[key] === 'string' && data[key].indexOf('@ref=') === 0) {
        const id = data[key].replace('@ref=', '')
        attrs[key] = DB.find(item => item.id === id)
      } else {
        attrs[key] = data[key]
      }
    }

    return attrs
  })

const randomString = () => String(Math.round(Math.random() * 999999999))

const Model = {
  reset: () => (DB = []),
  create: data => {
    const item = {
      id: randomString(),
      ...data,
    }

    DB.push(item)

    return Model.find(item.id)
  },
  all: () => cleanDB(),
  remove: data => {
    DB = DB.filter(item => item.id !== data.id)
    return true
  },
  where: ([key, value]) => {
    const items = DB.filter(item => item[key] === value)
    return items.map(i => Model.find(i.id))
  },
  find: id => {
    if (undefined === id) {
      throw new Error('missing comment id')
    }

    const item = cleanDB().find(item => item.id === id)
    if (undefined === item) {
      throw new Error('instance not found')
    }

    return item
  },
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
  update: ({ id, ...data }) => {
    if (undefined === id) {
      throw new Error('missing comment id')
    }

    const item = DB.find(i => i.id === id)
    if (undefined === item) {
      throw new Error('instance not found')
    }

    DB = DB.map(i => {
      if (item.id !== i.id) return i
      return { ...item, ...data }
    })

    return Model.find(id)
  },
}

export const User = Model
export const Comment = Model
