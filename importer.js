import debug from 'debug'
import FedoraClient from './index.js'
import { find as findDeps, sort as sortDeps } from './lib/dependencies.js'
import mapBaseIRI from './lib/dataset/mapBaseIRI.js'
import setGraph from './lib/dataset/setGraph.js'
import subjectToGraph from './lib/dataset/subjectToGraph.js'

const log = debug('fedora-client/importer')

async function importResource ({ client, graph, resource, failOnError, updateResource }) {
  log(`check if resource ${graph.value} already exists`)
  const exists = await client.exists(graph)

  if (exists && !updateResource) {
    log(`ignore existing resource ${graph.value}`)

    return
  }

  if (exists) {
    log(`update resource ${graph.value} (${resource.size} triples)`)
  } else {
    log(`create resource ${graph.value} (${resource.size} triples)`)
  }

  try {
    await client.put(graph, setGraph(resource))
  } catch (err) {
    if (failOnError) {
      throw err
    }

    log(`failed importing ${graph.value}`)
    console.error(err)
  }
}

async function importer ({ fedoraUrl, user, password, content, baseIri, emptyResources, failOnError, updateResources }) {
  log(`map ${baseIri} to ${fedoraUrl}`)
  const mapped = mapBaseIRI(content, baseIri, fedoraUrl)

  log('group triples into resources')
  const resources = subjectToGraph(mapped)

  log(`find dependencies (including empty graphs: ${emptyResources.toString()})`)
  const dependencies = findDeps(resources, fedoraUrl, { emptyResources })

  log('create dependency tree')
  const order = sortDeps(dependencies)

  const client = new FedoraClient({
    user,
    password
  })

  log('start importing resources')
  for (const graph of order) {
    log(`start importing resource ${graph.value}`)

    const resource = resources.match(null, null, null, graph)

    await importResource({
      client,
      graph,
      resource,
      failOnError,
      updateResource: updateResources
    })

    log(`finished importing resource ${graph.value}`)
  }
}

export default importer
