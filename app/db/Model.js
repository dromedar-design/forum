import { Client, query as q } from 'faunadb'

require('dotenv').config()

const secret =
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

const transformItem = response => ({
  id: response.ref.id,
  ...response.data,
})

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

const removeRaw = ({ client, ...props }) => client.query(q.Delete(ref(props)))

const remove = async props => {
  try {
    await removeRaw(props)
  } catch (e) {
    return false
  }

  return true
}

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

// = = = = =
// = = = = =
// = = = = =

const Model = ({ secret, ...config }) => {
  config.client = new Client({ secret })

  return {
    config,
    create: data => create({ ...config, data }),
    all: props => all({ ...config, ...props }),
    remove: data => remove({ ...config, data }),
    where: data => where({ ...config, data }),
    find: id => find({ ...config, id }),
  }
}

export const Factory = options => {
  const config = {
    name: '',
    secret: '',
    collection: `${options.name}s`,
    index: `all_${options.name}s`,
    data: {},
    ...options,
  }

  return Model(config)
}

let DB = []

export const Mock = {
  reset: () => (DB = []),
  create: ({ password, ...data }) => {
    const item = {
      id: String(new Date().getTime()),
      ...data,
    }

    DB.push(item)

    return item
  },
  all: () => {
    return DB
  },
  remove: data => {
    DB = DB.filter(item => item.id !== data.id)
    return true
  },
  where: (key, value) => DB.filter(item => item[key] === value),
  find: id => DB.find(item => item.id === id),
}

export const User = Factory({
  name: 'user',
  secret,
})
