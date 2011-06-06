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

// initialize client
var bp = Beatport()

// resources (i.e: featured/releases) as methods (camelCased, i.e: featuredReleases)
bp.releases({
  facets: [ 'genreName:Trance', 'performerName:Above&Beyond' ]
, perPage: 5
, page: 1
}, function(err, results, metadata) {
  // do something
})

bp.labelDetail({ id: 804 }, function(err, results, metadata) {
  // do something
})

```