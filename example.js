var Beatport = require('./beatport')

// initialize client
var bp = Beatport()

// resources (i.e: featured/releases) as methods (camelCased, i.e: featuredReleases)
bp.releases({
  facets: [ 'genreName:Trance', 'performerName:Above&Beyond' ]
, perPage: 5
, page: 1
}, function(err, results, metadata) {
  console.log(results)
})

bp.labelsDetail({ id: 804 }, function(err, results, metadata) {
  console.log(results)
})