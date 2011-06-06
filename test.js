var Beatport = require('./beatport')

var bp = Beatport()

;(function next(resources) {

  var resource = resources.shift()
  console.log(resource)

  bp[resource]({ id: 10 }, function(err, results, meta) {
    if ('object' === typeof results && results.type === 'error') {
      console.log('FAILED', resource)
    } else {
      console.log('ok', resource)
    }
    resources.length && next(resources)
  })

}(['genres', 'tracks', 'releases', 'charts', 'artists', 'labels'
, 'releasesDetail', 'chartsDetail', 'artistsDetail', 'labelsDetail'
, 'genresDetail', 'genresOverview', 'home'
, 'featuredReleases', 'featuredCharts', 'featuredLabels'
, 'slideshowsHeader', 'slideshowsFeature', 'slideshowsSmall'
, 'mostPopular', 'search']))