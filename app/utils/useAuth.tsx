import React, { ReactNode, useContext, useEffect, useReducer } from 'react'
import { RawUser, User } from '../db/user'
import { get, post } from './http'

const Context = React.createContext({})

interface State {
  user: User | null
  current: 'IN' | 'OUT' | 'LOADING'
  error: string | null
}

export const AuthProvider = ({
  children,
  initialUser,
}: {
  children: ReactNode
  initialUser: User | null
}) => {
  const [state, dispatch] = useReducer(reducer, {
    user: initialUser,
    current: initialUser ? 'IN' : 'OUT',
    error: null,
  })

  return <Context.Provider value={{ state, dispatch }} children={children} />
}

const reducer = (
  state: State,
  action: { type: string; payload?: { error?: string; user?: User } }
) => {
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
          if (!action.payload) return state

          return {
            ...state,
            user: null,
            current: 'OUT',
            error: action.payload.error,
          }

        case 'LOGGED_IN':
          if (!action.payload) return state

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

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    if (!state.user) return

    const response = await get('/user')

    if (response.error) {
      return dispatch({
        type: 'ERROR',
        payload: {
          error: response.error,
        },
      })
    }

    if (response.user === state.user) return

    if (response.user) {
      dispatch({ type: 'LOGIN' })
      dispatch({
        type: 'LOGGED_IN',
        payload: {
          user: response.user,
        },
      })
    } else {
      dispatch({ type: 'LOGOUT' })
      dispatch({ type: 'LOGGED_OUT' })
    }
  }

  const register = async (data: RawUser) => {
    dispatch({ type: 'REGISTER' })

    const response = await post('/register', data)

    if (response.error) {
      return dispatch({
        type: 'ERROR',
        payload: {
          error: response.error,
        },
      })
    }

    if (response.user) {
      dispatch({
        type: 'LOGGED_IN',
        payload: {
          user: response.user,
        },
      })
    } else {
      dispatch({ type: 'LOGGED_OUT' })
    }
  }

  const login = async (data: RawUser) => {
    dispatch({ type: 'LOGIN' })

    const response = await post('/login', data)

    if (response.error) {
      return dispatch({
        type: 'ERROR',
        payload: {
          error: response.error,
        },
      })
    }

    if (response.user) {
      dispatch({
        type: 'LOGGED_IN',
        payload: {
          user: response.user,
        },
      })
    } else {
      dispatch({ type: 'LOGGED_OUT' })
    }
  }

  const logout = async () => {
    dispatch({ type: 'LOGOUT' })

    const response = await post('/logout')

    if (response.error) {
      return dispatch({
        type: 'ERROR',
        payload: {
          error: response.error,
        },
      })
    }

    dispatch({ type: 'LOGGED_OUT' })
  }

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
