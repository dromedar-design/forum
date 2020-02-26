const { request } = require('graphql-request')
const { Keystone } = require('@keystonejs/keystone')
const { PasswordAuthStrategy } = require('@keystonejs/auth-password')
const {
  Text,
  Checkbox,
  Password,
  Relationship,
  DateTime,
  Virtual,
} = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')

const { GraphQLApp } = require('@keystonejs/app-graphql')
const { AdminUIApp } = require('@keystonejs/app-admin-ui')
const initialiseData = require('./initial-data')
const { NextApp } = require('@keystonejs/app-next')

const { MongooseAdapter: Adapter } = require('@keystonejs/adapter-mongoose')

const PROJECT_NAME = 'forum'

const keystone = new Keystone({
  name: PROJECT_NAME,
  adapter: new Adapter(),
  onConnect: initialiseData,
})

// Access control functions
const userIsAdmin = ({ authentication }) => {
  if (!authentication.item) return false
  return Boolean(authentication.item.isAdmin)
}
const userOwnsItem = ({ authentication, existingItem }) => {
  if (!existingItem) return false
  if (!authentication.item) return false
  return authentication.item.id === existingItem.id
}
const userIsAdminOrOwner = auth => {
  const isAdmin = access.userIsAdmin(auth)
  const isOwner = access.userOwnsItem(auth)
  return isAdmin ? isAdmin : isOwner
}
const access = { userIsAdmin, userOwnsItem, userIsAdminOrOwner }

keystone.createList('User', {
  fields: {
    name: {
      type: Text,
      isRequired: true,
      isUnique: true,
      access: {
        update: access.userIsAdminOrOwner,
      },
    },
    email: {
      type: Text,
      isRequired: true,
      isUnique: true,
      access: {
        update: access.userIsAdminOrOwner,
      },
    },
    isAdmin: {
      type: Checkbox,
      defaultValue: false,
      access: {
        update: access.userIsAdmin,
      },
    },
    password: {
      type: Password,
      isRequired: true,
      access: {
        read: access.userIsAdmin,
        update: access.userIsAdminOrOwner,
      },
    },
  },
  access: {
    delete: access.userIsAdmin,
  },
})

keystone.createList('Comment', {
  access: true,
  fields: {
    user: {
      type: Relationship,
      ref: 'User',
      isRequired: true,
    },
    text: {
      type: Markdown,
      isRequired: true,
    },
    parent: {
      type: Relationship,
      ref: 'Comment',
    },
    timestamp: {
      type: DateTime,
      defaultValue: new Date().toISOString(),
    },
    commentCount: {
      type: Virtual,
      graphQLReturnType: `Int`,
      resolver: async ({ id }) => {
        const response = await request(
          'http://localhost:3000/admin/api',
          `query($id: ID!) {
            _allCommentsMeta(where: { parent: { id: $id } }) {
              count
            }
          }`,
          { id }
        )
        return response._allCommentsMeta.count
      },
    },
  },
})

const authStrategy = keystone.createAuthStrategy({
  type: PasswordAuthStrategy,
  list: 'User',
})

module.exports = {
  keystone,
  apps: [
    new GraphQLApp(),
    new AdminUIApp({
      authStrategy,
    }),
    new NextApp({ dir: 'app' }),
  ],
}
