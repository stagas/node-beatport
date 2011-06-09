//
// beatport api client
// by stagas
//
// mit licenced
//

var agent = require('superagent')

var Beatport = module.exports = function(o) {
  if (!(this instanceof Beatport)) return new Beatport(o)

  this.options = {
    improve: o && 'undefined' !== typeof o.improve ? o.improve : true
  }
  o && delete o.improve

  this.query = {
    v: '1.0'
  , format: 'json'
  , perPage: 10
  , 'facets[]': []
  }
  for (var k in o) {
    this.query[k] = o[k]
  }
}

Beatport.prototype.api = function(resource, o, cb) {
  var self = this
  for (var k in this.query) {
    if (!o[k]) o[k] = this.query[k]
  }
  o['facets[]'] = o['facets[]'].concat(utils.facets(o.facets))
  delete o.facets
  agent.get('http://api.beatport.com' + resource, o, function(err, res, data) {
    if (err) return cb(err)
    if (self.options.improve) {
      Array.isArray(data.results) && data.results.forEach(utils.improve)
      if ('object' === typeof data.results) {
        ;[ 'topDownloads', 'featuredReleases', 'mostPopularReleases' ].forEach(function(k) {
          Array.isArray(data.results[k])
          && data.results[k].forEach(utils.improve)
        })   
      }
    }
    cb(null, data.results, data.metadata)
  })
}

// utils
var utils = {}

utils.get = function(a, b, cb) {
  b = b || {}
  agent.get(base + a, b, function(err, res, data) {
    cb(err, data)
  })
}

utils.facets = function(o) {
  var facets = []
  for (var k in o) {
    if (Array.isArray(o[k])) {
      o[k].forEach(function(el) {
        facets.push(k + ':' + el)
      })
    } else {
      facets.push(k + ':' + o[k])
    }
  }
  return facets
}

utils.camelCase = function(s) {
  ;['/', '-'].forEach(function(c) {
    if (~s.indexOf(c))
      s = s.split(c)[0] + s.split(c)[1][0].toUpperCase() + s.split(c)[1].slice(1)
  })
  return s
}

utils.camelot = function(k) {
  var n = 0, o = {}

  k = k.standard.letter
    + (k.standard.flat ? 'b' : k.standard.sharp ? '#' : '')
    + (k.standard.chord === 'minor' ? 'm' : 'M')

  ;['Abm', 'Ebm', 'Bbm', 'Fm', 'Cm', 'Gm'
  , 'Dm', 'Am', 'Em', 'Bm', 'F#m', 'Dbm'
  ].map(function(el) {
    n++
    return (o[el] = n + 'A')
  })

  n = 0

  ;['BM', 'F#M', 'DbM', 'AbM', 'EbM', 'BbM'
  , 'FM', 'CM', 'GM', 'DM', 'AM', 'EM'
  ].map(function(el) {
    n++
    return (o[el] = n + 'B')
  })
  
  o['C#m'] = o['Dbm']
  o['D#m'] = o['Ebm']
  o['G#m'] = o['Abm']
  o['A#m'] = o['Bbm']

  o['C#M'] = o['DbM']
  o['D#M'] = o['EbM']
  o['G#M'] = o['AbM']
  o['A#M'] = o['BbM']
  
  //if (!o[k]) console.log(k)

  return o[k]
}

utils.improve = function(item) {
  // convert to proper Date objects
  ;[ 'releaseDate', 'publishDate', 'lastPublishDate' ].forEach(function(k) {
    if (item[k]) item[k] = new Date(item[k])
  })

  ;[ 'genres', 'subGenres', 'artists' ].forEach(function(k) {
    if (item[k]) {
      item[k].names = []
      item[k].ids = []
      item[k].forEach(function(el) {
        if (el.type && el.type.toLowerCase() === 'remixer') {
          item.remixers = item.remixers || []
          item.remixers.names = item.remixers.names || []
          item.remixers.ids = item.remixers.ids || []
          item.remixers.push(el)
          item.remixers.names.push(el.name)
          item.remixers.ids.push(el.id)
        } else {
          item[k].names.push(el.name)
          item[k].ids.push(el.id)
        }
      })
    }
  })

  if (item.remixers && item.remixers.length) {
    item.remixers.forEach(function(el) {
      item.artists.splice(item.artists.indexOf(el), 1)
    })
  }

  if (item.key) item.camelot = utils.camelot(item.key)

  if (item.type === 'track')
    item.title = item.artists.names.join(' & ')
      + ' - '
      + item.name
      + ' (' + item.mixName + ')'
}

// create prototype methods
;['genres', 'tracks', 'releases', 'charts', 'artists', 'labels'
, 'releases/detail', 'charts/detail', 'artists/detail', 'labels/detail'
, 'genres/detail', 'genres/overview', 'home'
, 'featured/releases', 'featured/charts', 'featured/labels'
, 'slideshows/header', 'slideshows/feature', 'slideshows/small'
, 'most-popular', 'search'].forEach(function(k) {
  var key = k, v = '1.0'

  // api v2.0
  if (~['search'].indexOf(k)) v = '2.0'

  key = utils.camelCase(k)
  Beatport.prototype[key] = function(o, cb) {
    o.v = o.v || v
    this.api('/catalog/' + k, o, cb)
  }
})