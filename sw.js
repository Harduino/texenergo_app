CACHE_NAME = "texenergo-sw-v";
CACHE_VERSION = 12;
// find . -name '*.html'
var urlsToCache = [
]

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME + CACHE_VERSION)
      .then(function(cache) {
        cache.addAll(urlsToCache.map(u => { return(location.origin + u) }));
        self.skipWaiting();
      })
  );
});

self.addEventListener('activate', function(event) {
  caches.keys().then(function(xs){
    for (var i = 0; i < xs.length; i++) {
      caches.delete(xs[i]);
    }
  });
  event.waitUntil(self.clients.claim());
})

self.addEventListener('fetch', function(event) {
  console.debug("event", event);
  event.respondWith(
    caches.match(event.request).then(function(response) {
      if(avoidCache(event.request, response)) {
        return fetch(event.request).then(function(r){
          return r;
        })
      }

      if(serveFromCache(event.request, response)) return response;
      
      return fetch(event.request).then(function(r) {
        console.debug('r', r);
        return caches.open(CACHE_NAME + CACHE_VERSION).then(function(cache){
          cacheIt(cache, event.request, r);
          return r;
        })
      }).catch(function(err){
        console.debug("Caught error");
        if (event.request.url.indexOf("https://cdn.texenergo.com/products/" === 0)) {
          console.debug("No product image");
          // Fetches only at HTTPS.
          return fetch("https://cdn.texenergo.com/site/images/texenergo_logo_high.png").then(function(blank_image){
            return blank_image;
          })
        }
        debugger;
        if(response) return response;
      });
    }).catch(function(err){
    })
  )
});

// Если это обращение не к API и есть кеш, то вернуть кеш
function serveFromCache(request, response) {
  var a = request.url.indexOf("https://api.texenergo.com") < 0;
  var b = request.method === "GET";
  var c = response !== undefined;
  return a && b && c;
}

// Избегаем кеширования инфы из Auth0.
function avoidCache(request, response) {
  return request.url.indexOf("auth0") >= 0 || request.url.indexOf("mc.yandex.ru") >= 0 || request.url.indexOf("pubnub.com/v2/") >= 0
}

function cacheIt(cache, request, server_response) {
  if(request.method === "GET") {
    var cloned = server_response.clone();
    cloned.ttl_timestamp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 3; // 3 Days.
    cache.put(request, cloned);
  };
}