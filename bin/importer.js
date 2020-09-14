#!/usr/bin/env node

import program from 'commander'
import debug from 'debug'
import importer from '../importer.js'
import readDataset from '../lib/readDataset.js'

program
  .arguments('<filename> <fedoraUrl>')
  .option('-v, --verbose', 'enable diagnostic console output', false)
  .option('-u, --user <user>', 'Fedora user')
  .option('-p, --password <password>', 'Fedora password')
  .option('-b, --base-iri <baseIri>', 'base IRI used in file')
  .option('--disable-empty-resources', 'disable creating empty resources', false)
  .option('--disable-fail-on-error', 'continue importing if a resource fails', false)
  .option('--disable-update-resources', 'disable updating existing resources', false)
  .action(async (filename, fedoraUrl, { verbose, user, password, baseIri, disableEmptyResources, disableFailOnError, disableUpdateResources }) => {
    if (verbose) {
      debug.enable('fedora-client*')
    }

    try {
      const content = await readDataset(filename)

      await importer({
        fedoraUrl,
        user,
        password,
        content,
        baseIri,
        emptyResources: !disableEmptyResources,
        failOnError: !disableFailOnError,
        updateResources: !disableUpdateResources
      })
    } catch (err) {
      console.error(err)
    }
  })
  .parse(process.argv)
