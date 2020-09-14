import rdf from 'rdf-ext'
import rdfFsUtils from 'rdf-utils-fs'
import FedoraClient from '../index.js'
import mapBaseIRI from '../lib/dataset/mapBaseIRI.js'

const baseUrl = 'http://localhost:8080/fcrepo/rest/'

async function readDataset (filename) {
  return rdf.dataset().import(rdfFsUtils.fromFile(filename))
}

async function createResource (client, filename) {
  const resource = await readDataset(filename)
  const mappedResource = mapBaseIRI(resource, 'http://example.com/base/recordresources/68670', '')

  const location = await client.post(baseUrl, mappedResource)

  console.log(`created resource at ${location.value} with ${mappedResource.size} triples`)

  return location
}

async function fetchResource (client, iri) {
  const content = await client.get(iri)

  console.log(`fetch ${content.size} triples from ${iri}`)
  console.log(content.toString())
}

async function deleteResources (client, resources) {
  for (const resource of resources) {
    await client.delete(resource)
  }
}

async function main () {
  const client = new FedoraClient({
    user: 'fedoraAdmin',
    password: 'secret3'
  })

  await createResource(client, '../data/resources/record-68670.ttl')

  await fetchResource(client, 'http://localhost:8080/fcrepo/rest/5979b952-ddc5-4744-8194-d6dd7388d31f')

  await deleteResources(client, [])
}

async function start () {
  try {
    await main()
  } catch (err) {
    console.error(err)
  }
}

start()
