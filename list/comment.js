const { Relationship, DateTime, Integer } = require('@keystonejs/fields')
const { Markdown } = require('@keystonejs/fields-markdown')
const { computePosition } = require('../utils/logic')

const updateCounts = async ({
  operation,
  existingItem,
  updatedItem,
  actions: { query },
}) => {
  if (operation !== 'create' && operation !== 'delete') return

  const item = updatedItem || existingItem
  const id = String(item.parent)

  const { data, errors: readErrors } = await query(
    `
      query($id: ID!) {
        Comment(where: { id: $id }) {
          likeCount
        }
        children: _allCommentsMeta(where: { parent: { id: $id } }) {
          count
        }
      }
    `,
    { variables: { id } }
  )
  if (readErrors && readErrors.length > 0) throw readErrors[0]

  const { errors: updateErrors } = await query(
    `
      mutation($id: ID!, $commentCount: Int!, $position: Int!) {
        updateComment(id: $id, data: {
            commentCount: $commentCount,
            position: $position
        }) {
          id
        }
      }
    `,
    {
      variables: {
        id,
        commentCount: data.children.count,
        position: computePosition({
          createdAt: data.Comment.createdAt,
          commentCount: data.children.count,
          likeCount: data.Comment.likeCount,
        }),
      },
    }
  )
  if (updateErrors && updateErrors.length > 0) throw updateErrors[0]
}

module.exports = keystone =>
  keystone.createList('Comment', {
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
      text: {
        type: Markdown,
        isRequired: true,
      },
      parent: {
        type: Relationship,
        ref: 'Comment',
      },
      commentCount: {
        type: Integer,
        defaultValue: 0,
      },
      likeCount: {
        type: Integer,
        defaultValue: 0,
      },
      position: {
        type: Integer,
        defaultValue: 0,
      },
    },
    hooks: {
      afterChange: updateCounts,
      afterDelete: updateCounts,
    },
  })
