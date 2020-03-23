import { RawUser, User } from '@utils/http'
import React, { ReactNode, useContext, useEffect, useReducer } from 'react'
import { get, post } from './http'

interface Action {
  type: string
  payload?: { error?: string; user?: User }
}

interface State {
  user: User | null
  current: 'IN' | 'OUT' | 'LOADING'
  error: string | null
}

const defaultState: State = {
  user: null,
  current: 'LOADING',
  error: null,
}

const Context = React.createContext({
  state: defaultState,
  dispatch: (action: Action): State | void => defaultState,
})

export const AuthProvider = ({
  children,
  initialUser = null,
}: {
  children: ReactNode
  initialUser: User | null
}) => {
  // console.log('initial user: ', initialUser)
  const [state, dispatch] = useReducer(reducer, {
    user: initialUser,
    current: initialUser ? 'IN' : 'OUT',
    error: null,
  })

  return <Context.Provider value={{ state, dispatch }} children={children} />
}

const reducer = (state: State, action: Action): State => {
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
            error: action.payload.error || null,
          }

        case 'LOGGED_IN':
          if (!action.payload) return state

          return {
            ...state,
            user: action.payload.user || null,
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
    const response = await get('/user')

    if (response.error) {
      return dispatch({
        type: 'ERROR',
        payload: {
          error: response.error,
        },
      })
    }

    if (!response.user) return
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
    error: state.error,
    isLoading: state.current === 'LOADING',
    isAuthenticated: state.current === 'IN',
    register,
    login,
    logout,
  }
}
