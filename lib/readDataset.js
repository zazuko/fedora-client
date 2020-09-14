import rdf from 'rdf-ext'
import fromFile from 'rdf-utils-fs/fromFile.js'

async function readDataset (filename) {
  return rdf.dataset().import(fromFile(filename))
}

export default readDataset
