const { Text, Checkbox, Password } = require('@keystonejs/fields')
const access = require('../utils/access')

module.exports = keystone =>
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
