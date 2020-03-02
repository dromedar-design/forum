import fetch from 'isomorphic-unfetch'
import React, { useContext, useReducer } from 'react'
import useSWR, { trigger } from 'swr'

const BASEURL = 'http://localhost:3000/api'

const Context = React.createContext({})

export const DataProvider = ({ children, left, right }) => {
  const [state, dispatch] = useReducer(reducer, {
    selected: null,
    left: {
      query: left?.query || '',
      initial: left?.initial || {
        current: null,
        items: [],
      },
    },
    right: {
      query: right?.query || '',
      initial: right?.initial || {
        current: null,
        items: [],
      },
    },
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
    case 'RESET_LEFT':
      return {
        ...state,
        left: {
          query: '',
        },
      }

    case 'SET_RIGHT':
      return {
        ...state,
        right: {
          query: action.payload.query,
        },
      }

    case 'RESET_RIGHT':
      return {
        ...state,
        right: {
          query: '',
        },
      }

    case 'SET_SELECTED':
      return {
        ...state,
        selected: action.payload.comment,
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
  const { data: rightData } = useSWR(state.right.query, {
    initialData: state.right.initial,
  })

  const setLeft = data => {
    if (!data) {
      return dispatch({ type: 'RESET_LEFT' })
    }

    dispatch({
      type: 'SET_LEFT',
      payload: {
        query: data.query,
      },
    })
  }

  const setRight = data => {
    if (!data) {
      return dispatch({ type: 'RESET_RIGHT' })
    }

    dispatch({
      type: 'SET_RIGHT',
      payload: {
        query: data.query,
      },
    })
  }

  const postWithTrigger = async (url, variables = {}) => {
    const data = post(url, variables)
    trigger(state.left.query)
    trigger(state.right.query)
    return data
  }

  const getSide = side => {
    switch (side) {
      case 'left':
        return leftData
      case 'right':
        return rightData
    }
  }

  const setSelected = comment => {
    dispatch({
      type: 'SET_SELECTED',
      payload: {
        comment,
      },
    })
  }

  return {
    post: postWithTrigger,
    leftData,
    setLeft,
    rightData,
    setRight,
    getSide,
    selected: state.selected,
    setSelected,
  }
}
