import TermMap from '@rdfjs/term-map'
import TermSet from '@rdfjs/term-set'
import rdf from 'rdf-ext'
import * as component from './dataset/component.js'

function isLocal (baseIRI, term) {
  if (term.termType !== 'NamedNode') {
    return false
  }

  if (!term.value.startsWith(baseIRI)) {
    return false
  }

  return true
}

/**
 * Generates a Map of all resources and dependencies (including empty dependencies)
 * @param dataset
 * @param baseIRI
 * @returns {TermMap}
 */
function find (dataset, baseIRI, { emptyResources = true } = {}) {
  const all = new TermMap()

  // add resources
  for (const graph of component.graph(dataset)) {
    all.set(graph, new TermSet())
  }

  // empty resources can only be found via objects
  if (emptyResources) {
    for (const object of component.object(dataset)) {
      if (isLocal(baseIRI, object)) {
        all.set(object, new TermSet())
      }
    }
  }

  for (const quad of dataset) {
    if (!isLocal(baseIRI, quad.object)) {
      continue
    }

    const dependency = rdf.namedNode(quad.object.value.split('#')[0])

    if (quad.graph.equals(dependency)) {
      continue
    }

    all.set(quad.graph, all.get(quad.graph).add(dependency))
  }

  return all
}

/**
 * Sorts the given dependency map in a conflict free order
 * @param dependencies
 * @returns {Array}
 */
function sort (dependencies) {
  const order = []
  const left = new TermSet(dependencies.keys())
  const done = new TermSet()

  do {
    const startedWith = done.size

    for (const key of left) {
      if ([...dependencies.get(key)].every(dep => done.has(dep))) {
        order.push(key)
        done.add(key)
        left.delete(key)
      }
    }

    if (left.size !== 0 && startedWith === done.size) {
      const missing = [...left].map(term => term.value).join('\n\t')

      throw new Error(`could not resolve dependencies:\n\t${missing}`)
    }
  } while ((done.size !== dependencies.size))

  return order
}

export {
  find,
  sort
}
