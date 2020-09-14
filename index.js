import HttpError from 'http-errors'
import rdf from 'rdf-ext'
import rdfFetch from '@rdfjs/fetch'

function basicAuth (user, password) {
  return {
    authorization: `Basic ${Buffer.from(`${user}:${password}`).toString('base64')}`
  }
}

class FedoraClient {
  constructor ({ user, password }) {
    this.user = user
    this.password = password
  }

  fetch (url, options = {}) {
    options.factory = rdf

    options.headers = options.headers || {}

    if (options.body && !(options.headers && options.headers['content-type'])) {
      options.headers['content-type'] = 'text/turtle'
    }

    options.headers = { ...options.headers, ...basicAuth(this.user, this.password) }

    return rdfFetch(url, options)
  }

  async checkResponse (res) {
    if (!res.ok) {
      const text = await res.text()

      throw new HttpError(res.status, `${res.statusText}: ${text}`)
    }
  }

  async get (url) {
    const res = await this.fetch(url.value || url)

    await this.checkResponse(res)

    return res.dataset()
  }

  async post (url, quads) {
    const res = await this.fetch(url.value || url, {
      method: 'POST',
      headers: {
        accept: '*/*',
        'content-type': 'application/n-triples'
      },
      body: rdf.dataset([...quads])
    })

    await this.checkResponse(res)

    return rdf.namedNode(res.headers.get('location'))
  }

  async put (url, quads) {
    const res = await this.fetch(url.value || url, {
      method: 'PUT',
      headers: {
        accept: '*/*',
        'content-type': 'application/n-triples'
      },
      body: rdf.dataset([...quads])
    })

    await this.checkResponse(res)

    return rdf.namedNode(res.headers.get('location'))
  }

  async delete (url) {
    const res = await this.fetch(url.value || url, { method: 'DELETE' })

    await this.checkResponse(res)

    return true
  }

  async exists (url) {
    const res = await this.fetch(url.value || url, {
      method: 'HEAD'
    })

    return res.status === 200
  }
}

export default FedoraClient
