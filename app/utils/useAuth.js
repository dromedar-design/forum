import { request } from 'graphql-request'
import React, { useContext, useEffect, useReducer } from 'react'

const ENDPOINT = 'http://localhost:3000/admin/api'

const USER = `
  query {
    authenticatedUser {
      id
      email
      name
      isAdmin
    }
  }
`

const REGISTER = `
  mutation createUser($email: String!, $name: String!, $password: String!) {
    createUser(data: { email: $email, name: $name, password: $password }) {
      id
      email
      name
      isAdmin
    }
  }
`

const LOGIN = `
  mutation authUser($email: String!, $password: String!) {
    authenticateUserWithPassword(email: $email, password: $password) {
      item {
        id
        email
        name
        isAdmin
      }
    }
  }
`

const LOGOUT = `
  mutation unauthUser {
    unauthenticateUser {
      success
    }
  }
`

const Context = React.createContext({})

export const AuthProvider = ({ children, initialUser }) => {
  const [state, dispatch] = useReducer(reducer, {
    user: initialUser,
    current: initialUser ? 'IN' : 'OUT',
    error: null,
  })

  return <Context.Provider value={{ state, dispatch }} children={children} />
}

const reducer = (state, action) => {
  switch (state.current) {
    case 'OUT':
      switch (action.type) {
        case 'REGISTER':
          return {
            ...state,
            current: 'LOADING',
          }

        case 'LOGIN':
          return {
            ...state,
            current: 'LOADING',
          }

        default:
          return state
      }

    case 'LOADING':
      switch (action.type) {
        case 'ERROR':
          return {
            ...state,
            user: null,
            current: 'OUT',
            error: action.payload.error,
          }

        case 'LOGGED_IN':
          return {
            ...state,
            user: action.payload.user,
            current: 'IN',
          }

        case 'LOGGED_OUT':
          return {
            ...state,
            user: null,
            current: 'OUT',
          }

        default:
          return state
      }

    case 'IN':
      switch (action.type) {
        case 'LOGOUT':
          return {
            ...state,
            current: 'LOADING',
          }

        default:
          return state
      }

    default:
      return state
  }
}

export default () => {
  const { dispatch, state } = useContext(Context)

  const query = async (QUERY, variables = {}) => {
    let data

    try {
      data = await request(ENDPOINT, QUERY, {
        fetchPolicy: 'no-cache',
        ...variables,
      })
    } catch (e) {
      dispatch({
        type: 'ERROR',
        payload: {
          error: e.message,
        },
      })
      return null
    }

    return data
  }

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    const data = await query(USER)
    if (!data) return

    if (data.authenticatedUser === state.user) return

    if (data.authenticatedUser) {
      dispatch({ type: 'LOGIN' })
      dispatch({
        type: 'LOGGED_IN',
        payload: {
          user: data.authenticatedUser,
        },
      })
    } else {
      dispatch({ type: 'LOGOUT' })
      dispatch({ type: 'LOGGED_OUT' })
    }
  }

  const register = async props => {
    dispatch({ type: 'REGISTER' })

    const data = await query(REGISTER, props)
    if (!data) return

    if (!data.createUser) {
      dispatch({ type: 'LOGGED_OUT' })
      return
    }

    login(props)
  }

  const login = async props => {
    dispatch({ type: 'LOGIN' })

    const data = await query(LOGIN, props)
    if (!data) return

    if (
      data.authenticateUserWithPassword &&
      data.authenticateUserWithPassword.item
    ) {
      dispatch({
        type: 'LOGGED_IN',
        payload: {
          user: data.authenticateUserWithPassword.item,
        },
      })
    } else {
      dispatch({ type: 'LOGGED_OUT' })
    }
  }

  const logout = async () => {
    dispatch({ type: 'LOGOUT' })

    const data = await query(LOGOUT)
    if (!data) return

    if (data.unauthenticateUser && data.unauthenticateUser.success) {
      dispatch({ type: 'LOGGED_OUT' })
    } else {
      dispatch({
        type: 'ERROR',
        payload: {
          error: 'Logout no work :(',
        },
      })
    }
  }

  // console.log(state.current, state.user)

  if (state.error) {
    console.log(state.error)
  }

  return {
    user: state.user,
    isLoading: state.current === 'LOADING',
    isAuthenticated: state.current === 'IN',
    register,
    login,
    logout,
  }
}
