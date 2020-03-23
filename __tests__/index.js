import { Comment } from '@db/Model'
import Page from '@pages/index'
import { render } from '@testing-library/react'
import { DataProvider } from '@utils/useData'
import faker from 'faker'
import React from 'react'

jest.mock('@db/Model')

const addComments = async number => {
  let comments = []

  for (let i = 0; i < number; i++) {
    comments.push(
      await Comment.create({
        text: faker.lorem.sentence(),
      })
    )
  }

  return comments
}

test('shows empty state when there are no comments', async () => {
  const { findAllByText } = render(
    <DataProvider>
      <Page />
    </DataProvider>
  )

  const loading = await findAllByText('Loading ...')
  expect(loading.length).toBe(2)
})

test('renders the inital comments', async () => {
  const comments = await addComments(5)

  const { queryByText, findAllByText } = render(
    <DataProvider
      right={{
        initial: {
          current: null,
          items: comments,
        },
      }}
    >
      <Page />
    </DataProvider>
  )

  comments.forEach(comment => {
    expect(queryByText(comment.text)).not.toBeNull()
  })

  const loading = await findAllByText('Loading ...')
  expect(loading.length).toBe(1)

  comments.forEach(comment => {
    Comment.remove(comment)
  })
})