import fetch from 'isomorphic-unfetch'

if (process.env.NODE_ENV === 'test') {
  require('dotenv').config()
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

const fetcher = ({ url, ...extra }: prepareOptions) =>
  fetch(url, {
    ...extra,
  }).then(async res => {
    // try {
    return { res, data: await res.json() }
    // } catch (e) {
    //   if (e.type !== 'invalid-json') {
    //     throw e
    //   }

    //   return { res, data: {} }
    // }
  })

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

export const get = (url: string, variables: vars = {}) =>
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

export const post = (url: string, variables: vars = {}) =>
  fetcher(preparePost(url, variables))
