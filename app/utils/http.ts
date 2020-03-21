import fetch from 'isomorphic-unfetch'

if (process.env.NODE_ENV === 'test') {
  require('dotenv').config()
}

interface BaseUser {
  email: string
  name?: string
}

export interface RawUser extends BaseUser {
  password: string
}

export interface User extends BaseUser {
  id: number
}

interface faunaResponse {
  ref: {
    id: number
  }
  data: BaseUser
}

const BASEURL = process.env.BASEURL + '/api'

type method = 'GET' | 'POST'

interface vars {
  [key: string]: string
}

interface prepareOptions {
  url: string
  method: method
  body?: string
  headers?: Headers
}

export interface CustomResponse {
  res: Response
  user?: User
  error?: string
}

const fetcher = ({ url, ...extra }: prepareOptions) =>
  fetch(url, {
    ...extra,
  }).then(
    async (res: Response): Promise<CustomResponse> => {
      const data = await res.json()

      return { res, ...data }
    }
  )

export const prepareGet = (
  url: string,
  variables: vars = {}
): prepareOptions => {
  let finalUrl = url.indexOf('http') === -1 ? BASEURL + url : url

  if (Object.keys(variables).length) {
    let params = new URLSearchParams()
    Object.keys(variables).forEach(key => params.append(key, variables[key]))

    finalUrl = `${finalUrl}?${params}`
  }

  return {
    url: finalUrl,
    method: 'GET',
  }
}

export const get = (url: string, variables: any = {}) =>
  fetcher(prepareGet(url, variables))

export const preparePost = (
  url: string,
  variables: vars = {}
): prepareOptions => {
  let config: prepareOptions = {
    url: url.indexOf('http') === -1 ? BASEURL + url : url,
    method: 'POST',
    body: JSON.stringify(variables),
    headers: new Headers({
      'Content-Type': 'application/json',
    }),
  }

  return config
}

export const post = (url: string, variables: any = {}) =>
  fetcher(preparePost(url, variables))
