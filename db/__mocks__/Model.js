let DB = {}

const randomString = () => String(Math.round(Math.random() * 999999999))

class Model {
  constructor(options) {
    if (!options.name) {
      throw new Error('no name was provided')
    }

    this.config = {
      collection: `${options.name}s`,
      index: `all_${options.name}s`,
      ...options,
    }

    this.reset()
  }

  _getDB() {
    return DB[this.config.collection]
  }

  _updateDB(newDB) {
    DB[this.config.collection] = newDB
  }

  _updateDBRows(func) {
    this._updateDB(
      this._getDB().map(item => {
        return func(item)
      })
    )
  }

  reset() {
    this._updateDB([])
  }

  _cleanModel({ password, secret, ...model }) {
    return model
  }

  _cleanDB() {
    return this._getDB().map(data => {
      const attrs = {}

      for (const key in data) {
        if (0 === key.indexOf('_')) {
          continue
        }

        if (typeof data[key] === 'string' && data[key].indexOf('@ref=') === 0) {
          const id = data[key].replace('@ref=', '')
          const model = this._getDB().find(item => item.id === id)

          if (!model) {
            attrs[key] = null
          } else {
            attrs[key] = this._cleanModel(model)
          }
        } else {
          attrs[key] = data[key]
        }
      }

      return this._cleanModel(attrs)
    })
  }

  create(data) {
    const model = {
      id: randomString(),
      ...data,
    }

    this._getDB().push(model)

    return this.find(model.id)
  }

  all() {
    return this._cleanDB()
  }

  remove(data) {
    this._updateDB(this._getDB().filter(item => item.id !== data.id))
    return true
  }

  where([key, value]) {
    const items = this._getDB().filter(item => item[key] === value)
    return items.map(item => this.find(item.id))
  }

  find(id) {
    if (undefined === id) {
      throw new Error('missing comment id')
    }

    const model = this._cleanDB().find(item => {
      return item.id === id
    })
    if (undefined === model) {
      throw new Error('instance not found')
    }

    return model
  }

  login(data) {
    if (!data || !data.password || !data.email) {
      throw new Error('invalid login data')
    }

    const model = this._getDB().find(item => item.email === data.email)
    if (!model) {
      throw new Error('authentication failed')
    }

    if (model.password !== data.password) {
      throw new Error('authentication failed')
    }

    const secret = randomString()
    this._updateDBRows(item => {
      if (item.email === data.email) {
        item.secret = secret
      }

      return item
    })

    return secret
  }

  bySecret(secret) {
    if (!secret || typeof secret !== 'string') {
      throw new Error('invalid auth token')
    }

    const model = this._getDB().find(item => item.secret === secret)
    if (!model) {
      throw new Error('unauthorized')
    }

    return this._cleanModel(model)
  }

  ref({ id }) {
    return `@ref=${id}`
  }

  logout(secret) {
    if (!secret || typeof secret !== 'string') {
      throw new Error('invalid auth token')
    }

    const model = this.bySecret(secret)

    this._updateDBRows(item => {
      if (model.id !== item.id) return i

      delete item.secret
      return item
    })

    return true
  }

  update({ id, ...data }) {
    if (undefined === id) {
      throw new Error('missing comment id')
    }

    const model = this._getDB().find(item => item.id === id)
    if (undefined === model) {
      throw new Error('instance not found')
    }

    this._updateDBRows(item => {
      if (model.id !== item.id) return item

      return { ...model, ...data }
    })

    return this.find(id)
  }
}

export const User = new Model({ name: 'user' })
export const Comment = new Model({ name: 'comment' })
