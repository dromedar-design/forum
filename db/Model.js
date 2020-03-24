import { Client, query as q } from 'faunadb'

if (process.env.NODE_ENV === 'test') {
  require('dotenv').config()
}

const SERVER_SECRET =
  process.env.NODE_ENV === 'development'
    ? process.env.FAUNA_SERVER_KEY
    : process.env.FAUNA_TEST_KEY

class Model {
  constructor({ secret, ...options }) {
    if (!options.name) {
      throw new Error('no name was provided')
    }
    if (!secret) {
      throw new Error('no secret was provided')
    }

    this.client = new Client({ secret })

    this.config = {
      collection: `${options.name}s`,
      index: `all_${options.name}s`,
      ...options,
    }
  }

  async transformValue(prop) {
    if (typeof prop === 'object') {
      if (prop.hasOwnProperty('value')) {
        return await this.find(prop.value.id, prop.value.collection.value.id)
      }
    }

    return prop
  }

  async transformItem(response) {
    const data = {}

    for (const key in response.data) {
      if (0 !== key.indexOf('_')) {
        data[key] = await this.transformValue(response.data[key])
      }
    }

    return {
      id: response.ref.id,
      ...data,
    }
  }

  async transformList(response) {
    return Promise.all(
      response.data.map(item => {
        return this.transformItem(item)
      })
    )
  }

  ref({ id, collection = this.config.collection }) {
    return q.Ref(q.Collection(collection), id)
  }

  async find(id, collection = this.config.collection) {
    return this.transformItem(
      await this.client.query(q.Get(this.ref({ id, collection })))
    )
  }

  async create({ password, ...data }) {
    return this.transformItem(
      await this.client.query(
        q.Create(q.Collection(this.config.collection), {
          credentials: { password },
          data,
        })
      )
    )
  }

  async index({ index, value = undefined }) {
    return await this.transformList(
      await this.client.query(
        q.Map(q.Paginate(q.Match(q.Index(index), value)), ref => q.Get(ref))
      )
    )
  }

  async all() {
    return await this.index({ index: this.config.index })
  }

  remove(data) {
    this.client.query(q.Delete(this.ref(data)))
    return true
  }

  async where([key, value]) {
    return await this.index({
      index: `${this.config.collection}_by_${key}`,
      value,
    })
  }

  async update(data) {
    return this.transformItem(
      await this.client.query(q.Update(this.ref(data), { data }))
    )
  }

  async login(data) {
    if (!data || !data.email || !data.password) {
      throw new Error('invalid login data')
    }

    const list = `${this.config.collection}_by_email`

    const response = await this.client.query(
      q.Login(q.Match(q.Index(list), data.email), {
        password: data.password,
      })
    )

    return response.secret
  }

  async bySecret(secret) {
    if (!secret || typeof secret !== 'string') {
      throw new Error('invalid auth token')
    }

    return this.transformItem(
      await new Client({ secret }).query(q.Get(q.Identity()))
    )
  }

  async logout(secret) {
    if (!secret || typeof secret !== 'string') {
      throw new Error('invalid auth token')
    }

    return await new Client({ secret }).query(q.Logout(false))
  }
}

export const User = new Model({
  name: 'user',
  secret: SERVER_SECRET,
})

export const Comment = new Model({
  name: 'comment',
  secret: SERVER_SECRET,
})
