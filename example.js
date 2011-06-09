var Beatport = require('./beatport')

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