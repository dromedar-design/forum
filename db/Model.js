import { Client, query as q } from 'faunadb'

if (process.env.NODE_ENV === 'test') {
  require('dotenv').config()
}

const SERVER_SECRET =
  process.env.NODE_ENV === 'development'
    ? process.env.FAUNA_SERVER_KEY
    : process.env.FAUNA_TEST_KEY

// interface modelOptions {
//   name?: string
//   collection?: string
//   index?: string
//   data?: object
//   secret?: string
//   client?: Client
// }

// interface itemResponse {
//   ref: { id: number }
//   data: object
// }

// interface listResponse {
//   data: object[]
// }

const transformValue = value => {
  if (typeof value === 'object') {
    if (value.hasOwnProperty('value')) {
      return value.value.id
    }
  }

  return value
}

const transformItem = response => {
  const data = {}

  for (const key in response.data) {
    if (0 !== key.indexOf('_')) {
      data[key] = transformValue(response.data[key])
    }
  }

  return {
    id: response.ref.id,
    ...data,
  }
}

const transformList = response => response.data.map(item => transformItem(item))

const createRaw = ({ client, collection, data: { password, ...data } }) =>
  client.query(
    q.Create(q.Collection(collection), {
      credentials: { password },
      data,
    })
  )
const create = async props => transformItem(await createRaw(props))

const ref = ({ data, collection }) => q.Ref(q.Collection(collection), data.id)

const index = ({ client, index, value }) =>
  client.query(
    q.Map(q.Paginate(q.Match(q.Index(index), value)), ref => q.Get(ref))
  )

const allRaw = props => index(props)

const all = async props => transformList(await allRaw(props))

const removeRaw = ({ client, ...props }) => {
  client.query(q.Delete(ref(props)))
  return true
}

const remove = props => removeRaw(props)

const whereRaw = ({ client, collection, data }) => {
  const list = `${collection}_by_${data[0]}`

  return index({
    client,
    index: list,
    value: data[1],
  })
}

const where = async props => transformList(await whereRaw(props))

const findRaw = ({ client, collection, id }) => {
  const item = ref({
    data: {
      id,
    },
    collection,
  })

  return client.query(q.Get(item))
}

const find = async props => transformItem(await findRaw(props))

const updateRaw = ({ client, collection, data }) =>
  client.query(q.Update(ref({ collection, data }), { data }))

const update = async props => transformItem(await updateRaw(props))

// = = = = =
// = = = = =
// = = = = =

const loginRaw = async ({ data, client, collection }) => {
  if (!data || !data.password || !data.email) {
    throw new Error('invalid login data')
  }

  const list = `${collection}_by_email`

  return client.query(
    q.Login(q.Match(q.Index(list), data.email), {
      password: data.password,
    })
  )
}

const login = async data => (await loginRaw(data)).secret

const bySecretRaw = ({ secret }) => {
  if (!secret || typeof secret !== 'string') {
    throw new Error('invalid auth token')
  }

  return new Client({ secret }).query(q.Get(q.Identity()))
}

const bySecret = async data => transformItem(await bySecretRaw(data))

const logout = ({ secret }) => {
  if (!secret || typeof secret !== 'string') {
    throw new Error('invalid auth token')
  }

  return new Client({ secret }).query(q.Logout(false))
}

// = = = = =
// = = = = =
// = = = = =

const Model = ({ secret, auth, ...config }) => {
  if (!secret) {
    throw new Error('no secret was provided')
  }

  config.client = new Client({ secret })

  let model = {
    config,
    create: data => create({ ...config, data }),
    all: props => all({ ...config, ...props }),
    remove: data => remove({ ...config, data }),
    where: data => where({ ...config, data }),
    find: id => find({ ...config, id }),
    ref: data => ref({ ...config, data }),
    update: data => update({ ...config, data }),
  }

  if (auth) {
    model.login = data => login({ ...config, data })
    model.bySecret = secret => bySecret({ ...config, secret })
    model.logout = secret => logout({ ...config, secret })
  }

  return model
}

export const Factory = options => {
  if (!options.name) {
    throw new Error('no name was provided')
  }

  const config = {
    collection: `${options.name}s`,
    index: `all_${options.name}s`,
    ...options,
  }

  return Model(config)
}

export const User = Factory({
  name: 'user',
  secret: SERVER_SECRET,
  auth: true,
})

export const Comment = Factory({
  name: 'comment',
  secret: SERVER_SECRET,
})
