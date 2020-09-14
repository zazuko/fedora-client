import rdf from 'rdf-ext'

function subjectToGraph (input) {
  const output = rdf.dataset()

  for (const quad of input) {
    output.add(rdf.quad(
      quad.subject,
      quad.predicate,
      quad.object,
      rdf.namedNode(quad.subject.value.split('#')[0])
    ))
  }

  return output
}

export default subjectToGraph
