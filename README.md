# fedora-client

Client to access Fedora Repositories

## Command Line Importer

The package comes with a command line to to import Turtle or N-Triples files to a Fedora Repository.
It's located at `bin/importer.js` and can be used like this:

```bash
./bin/importer.js my-data-dump.nt http://fedora.example.org:8080/fcrepo/rest/
```

See the usage for optional arguments:

```bash
./bin/imports.js --help
```
