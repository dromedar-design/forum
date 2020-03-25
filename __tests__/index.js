if ('on' === process.env.MOCK) {
  jest.mock('@db/Model')
}

import { Comment } from '@db/Model'
import Page from '@pages/index'
import { render } from '@testing-library/react'
import { DataProvider } from '@utils/useData'
import faker from 'faker'
import fetch from 'jest-fetch-mock'
import React from 'react'

beforeAll(() => {
  // Mock user call
  fetch.enableFetchMocks()
  fetch.mockResponse(JSON.stringify({}))
})

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

  comments.forEach(comment => {
    Comment.remove(comment)
  })

  const loading = await findAllByText('Loading ...')
  expect(loading.length).toBe(1)
})
