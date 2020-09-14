import rdf from 'rdf-ext'

function mapTermBaseIRI (term, from, to) {
  if (term.termType === 'Quad') {
    return mapQuadBaseIRI(term, from, to)
  }

  if (term.termType !== 'NamedNode') {
    return term
  }

  if (term.value.startsWith(from)) {
    return rdf.namedNode(to + term.value.slice(from.length))
  }

  return term
}

function mapQuadBaseIRI (quad, from, to) {
  return rdf.quad(
    mapTermBaseIRI(quad.subject, from, to),
    mapTermBaseIRI(quad.predicate, from, to),
    mapTermBaseIRI(quad.object, from, to),
    mapTermBaseIRI(quad.graph, from, to)
  )
}

function mapDatasetBaseIRI (dataset, from, to) {
  return rdf.dataset([...dataset].map(quad => mapQuadBaseIRI(quad, from, to)))
}

function mapBaseIRI (object, from, to) {
  if (object.termType) {
    return mapTermBaseIRI(object, from, to)
  }

  if (object.subject) {
    return mapQuadBaseIRI(object, from, to)
  }

  if (typeof object.match === 'function') {
    return mapDatasetBaseIRI(object, from, to)
  }

  throw new Error('unknown object type')
}

export default mapBaseIRI
