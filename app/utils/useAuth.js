import React, { useContext, useReducer } from 'react'

// const STORAGE_KEY = 'DD_CURRENT_USER'

// let initialUser = null
// if (typeof window !== 'undefined') {
//   const data = localStorage.getItem(STORAGE_KEY)
//   if (data) {
//     initialUser = JSON.parse(data)
//   }
// }

const INITAL_STATE = {
  user: null,
  current: 'OUT',
}

// const USER = gql`
//   query {
//     authenticatedUser {
//       id
//       email
//       name
//     }
//   }
// `

// const LOGIN = gql`
//   mutation authUser($email: String!, $password: String!) {
//     authenticateUserWithPassword(email: $email, password: $password) {
//       item {
//         id
//         email
//         name
//       }
//     }
//   }
// `

// const LOGOUT = gql`
//   mutation unauthUser {
//     unauthenticateUser {
//       success
//     }
//   }
// `

const Context = React.createContext(INITAL_STATE)

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, INITAL_STATE)

  return <Context.Provider value={{ state, dispatch }} children={children} />
}

const reducer = (state, action) => {
  switch (state.current) {
    case 'OUT':
      switch (action.type) {
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
        case 'CANCEL':
          return state

        case 'LOGGED_IN':
          if (typeof window !== 'undefined') {
            localStorage.setItem(
              STORAGE_KEY,
              JSON.stringify(action.payload.user)
            )
          }
          return {
            ...state,
            current: 'IN',
            user: action.payload.user,
          }

        case 'LOGGED_OUT':
          if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY)
          }
          return {
            ...state,
            current: 'OUT',
            user: null,
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

  return {}
}
