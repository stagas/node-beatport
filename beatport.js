//
// beatport api client
// by stagas
//
// mit licenced
//

var agent = require('superagent')

var Beatport = module.exports = function(o) {
  if (!(this instanceof Beatport)) return new Beatport(o)
  
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
  for (var k in this.query) {
    if (!o[k]) o[k] = this.query[k]
  }
  o['facets[]'] = o['facets[]'].concat(utils.facets(o.facets))
  delete o.facets
  agent.get('http://api.beatport.com' + resource, o, function(err, res, data) {
    Array.isArray(data.results) && data.results.forEach(utils.improveTrack)
    if ('object' === typeof data.results) {
      Array.isArray(data.results.topDownloads)
      && data.results.topDownloads.forEach(utils.improveTrack)
    }
    cb(err, data.results, data.metadata)
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
  
  if (!o[k]) console.log(k)

  return o[k]
}

utils.improveTrack = function(item) {
  if (item.key) {
    ;(function(track) {
      track.artists.names = []
      track.remixers = []
      track.remixers.names = []
      track.remixers.ids = []
      track.artists.ids = []
      track.camelot = utils.camelot(track.key)
      track.artists.forEach(function(artist) {
        if (artist.type.toLowerCase() === 'artist') {
          track.artists.names.push(artist.name)
          track.artists.ids.push(artist.id)
        } else {
          track.remixers.push(artist)
          track.remixers.names.push(artist.name)
          track.remixers.ids.push(artist.id)
        }
      })
      track.title = track.artists.names.join(' & ')
        + ' - '
        + track.name
        + ' (' + track.mixName + ')'
    }(item))
  }
}

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