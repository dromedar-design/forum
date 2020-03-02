import fetch from 'isomorphic-unfetch'
import React, { useContext, useReducer } from 'react'
import useSWR, { trigger } from 'swr'

const BASEURL = 'http://localhost:3000/api'

const Context = React.createContext({})

export const DataProvider = ({ children, left }) => {
  let data

  if (left) {
    data = {
      query: left.query,
      initial: left.initial,
    }
  } else {
    data = {
      query: '',
      initial: {
        current: null,
        items: [],
      },
    }
  }

  const [state, dispatch] = useReducer(reducer, {
    left: data,
  })

  return <Context.Provider value={{ state, dispatch }} children={children} />
}

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_LEFT':
      return {
        ...state,
        left: {
          query: action.payload.query,
        },
      }

    default:
      return state
  }
}

const fetcher = ({ url, method, extra = {} }) =>
  fetch(BASEURL + url, {
    method: method,
    headers: {
      'Content-Type': 'application/json',
    },
    ...extra,
  }).then(res => res.json())

export const get = (url, variables = {}) => {
  let params = new URLSearchParams()
  Object.keys(variables).forEach(key => params.append(key, variables[key]))

  return fetcher({
    url: `${url}?${params}`,
    method: 'GET',
  })
}

export const post = (url, variables = {}) => {
  return fetcher({
    url,
    method: 'POST',
    extra: {
      body: JSON.stringify(variables),
    },
  })
}

export default () => {
  const { dispatch, state } = useContext(Context)
  const { data: leftData } = useSWR(state.left.query, {
    initialData: state.left.initial,
  })

  const setLeft = ({ query, initial }) => {
    dispatch({
      type: 'SET_LEFT',
      payload: {
        query,
      },
    })
  }

  const postWithTrigger = async (url, variables = {}) => {
    const data = post(url, variables)
    trigger(state.left.query)
    return data
  }

  return {
    post: postWithTrigger,
    left: state.left,
    leftData,
    setLeft,
  }
}
