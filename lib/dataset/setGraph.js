import rdf from 'rdf-ext'

function setGraph (input, graph) {
  graph = graph || rdf.defaultGraph()

  const output = rdf.dataset()

  for (const quad of input) {
    output.add(rdf.quad(
      quad.subject,
      quad.predicate,
      quad.object,
      graph
    ))
  }

  return output
}

export default setGraph
