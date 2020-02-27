const { Relationship, Select, DateTime } = require('@keystonejs/fields')
const { computePosition, computeLikeCount } = require('../utils/logic')

const updateCounts = async ({
  existingItem,
  updatedItem,
  actions: { query },
}) => {
  const item = updatedItem || existingItem
  const id = String(item.comment)

  const { data, errors: readErrors } = await query(
    `
      query($id: ID!) {
        Comment(where: { id: $id }) {
          createdAt
          commentCount
        }
        allLikes(where: { comment: { id: $id } }) {
          value
        }
      }
    `,
    { variables: { id } }
  )
  if (readErrors && readErrors.length > 0) throw readErrors[0]

  const likeCount = computeLikeCount(data.allLikes)
  console.log(likeCount)

  const { errors: updateErrors } = await query(
    `
      mutation($id: ID!, $likeCount: Int!, $position: Int!) {
        updateComment(id: $id, data: {
            likeCount: $likeCount,
            position: $position
        }) {
          id
        }
      }
    `,
    {
      variables: {
        id,
        likeCount,
        position: computePosition({
          createdAt: data.Comment.createdAt,
          commentCount: data.Comment.commentCount,
          likeCount,
        }),
      },
    }
  )
  if (updateErrors && updateErrors.length > 0) throw updateErrors[0]
}

module.exports = keystone =>
  keystone.createList('Like', {
    access: true,
    fields: {
      createdAt: {
        type: DateTime,
        defaultValue: new Date().toISOString(),
      },
      user: {
        type: Relationship,
        ref: 'User',
        isRequired: true,
      },
      comment: {
        type: Relationship,
        ref: 'Comment',
        isRequired: true,
      },
      value: {
        type: Select,
        options: ['UP', 'DOWN', 'NULL'],
      },
    },
    hooks: {
      afterChange: updateCounts,
      afterDelete: updateCounts,
    },
  })
