import TermSet from '@rdfjs/term-set'

const components = new Set([
  'subject',
  'predicate',
  'object',
  'graph'
])

function component (component, dataset) {
  if (!components.has(component)) {
    throw new Error(`Can't extract component ${component} from dataset`)
  }

  const set = new TermSet()

  for (const quad of dataset) {
    set.add(quad[component])
  }

  return set
}

const subject = component.bind(null, 'subject')
const predicate = component.bind(null, 'predicate')
const object = component.bind(null, 'object')
const graph = component.bind(null, 'graph')

export {
  subject,
  predicate,
  object,
  graph
}
