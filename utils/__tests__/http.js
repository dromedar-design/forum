import { prepareGet, preparePost } from '../http'

describe('http', () => {
  test('simple prepareGet works', () => {
    const conf = prepareGet('/url')

    expect(conf).toMatchInlineSnapshot(`
      Object {
        "method": "GET",
        "url": "http://localhost:3000/api/url",
      }
    `)
  })

  test('prepareGet with params works', () => {
    const conf = prepareGet('/url', {
      foo: 'bar',
    })

    expect(conf).toMatchInlineSnapshot(`
      Object {
        "method": "GET",
        "url": "http://localhost:3000/api/url?foo=bar",
      }
    `)
  })

  test('prepareGet with absolute url', () => {
    const conf = prepareGet('https://dromedar.design', {
      foo: 'bar',
    })

    expect(conf).toMatchInlineSnapshot(`
      Object {
        "method": "GET",
        "url": "https://dromedar.design?foo=bar",
      }
    `)
  })

  test('simple preparePost works', () => {
    const conf = preparePost('/url')

    expect(conf).toMatchInlineSnapshot(`
      Object {
        "body": "{}",
        "headers": Headers {},
        "method": "POST",
        "url": "http://localhost:3000/api/url",
      }
    `)
  })

  test('preparePost with params works', () => {
    const conf = preparePost('/url', {
      foo: 'bar',
    })

    expect(conf).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"foo\\":\\"bar\\"}",
        "headers": Headers {},
        "method": "POST",
        "url": "http://localhost:3000/api/url",
      }
    `)
  })

  test('preparePost with absolute url', () => {
    const conf = preparePost('https://dromedar.design', {
      foo: 'bar',
    })

    expect(conf).toMatchInlineSnapshot(`
      Object {
        "body": "{\\"foo\\":\\"bar\\"}",
        "headers": Headers {},
        "method": "POST",
        "url": "https://dromedar.design",
      }
    `)
  })
})
