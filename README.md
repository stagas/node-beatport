[![build status](https://secure.travis-ci.org/stagas/node-beatport.png)](http://travis-ci.org/stagas/node-beatport)
node-beatport
=============
Beatport API client - resources as methods, also attempts to improve the
resulting data to make them more useful.

Installation
------------
    npm install beatport

Usage / Examples
----------------
```javascript

var Beatport = require('beatport')

// initialize and configure client
var bp = Beatport({ perPage: 10, sortBy: 'releaseDate desc' })

// resources (i.e: featured/releases) as methods (camelCased, i.e: featuredReleases)
//
// a search for tracks by 'digweed'
bp.search({ query: 'digweed', facets: { fieldType: [ 'track' ] } }, function(err, results, metadata) {
  results.forEach(function(track) {
    console.log(track.title)
  })
})

// get tracks of genre Tech House and performers John Digweed and Nick Muir
bp.tracks({
  facets: {
    genreName: 'Tech House'
  , performerName: [ 'John Digweed', 'Nick Muir' ]
  }
, page: 1
}, function(err, results, metadata) {
  results.forEach(function(track) {
    console.log(track.title)
  })
})

// get details of label with id 804
bp.labelsDetail({ id: 804 }, function(err, results, metadata) {
  results.mostPopularReleases.forEach(function(release) {
    console.log(release.name, release.artists.names)
  })
})

```

Improving the Beatport data
---------------------------
In order to make the resulting Beatport data more Javascript-friendly, by default
the client attempts to improve the data. If you don't want this behavior, just initialize
the client with an `improve: false` option.

This is what it does, so far:

- Adds a .camelot field containing the Camelot system representation of the track key (ie '8B')
- Finds remixers in the .artists field and extracts them to their own array .remixers
- Parses the ids and names of artists and remixers and creates arrays as properties in the Object type
of the existing arrays: .artists.names, .artists.ids, .remixers.names, .remixers.ids
- Converts date strings to Date objects
- Adds .title field to the tracks, with a proper representation of the track, like this: Artist Name - Track Name (MixName)
