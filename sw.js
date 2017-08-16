const CACHE_VERSION = 'v1'

self.addEventListener('install', function(event) {
//Caching
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function(cache) {
      return cache.addAll([
        'index.html',
        '/scripts/app.js',
        '/resources/beach_dinner.jpg',
        '/resources/ocean.mp3',
      ]);
    })
  );
});

this.addEventListener('fetch', function(event) {
//Retrieval from cache
  event.respondWith(
    caches.match(event.request).then(function(resp) {
      return resp || fetch(event.request).then(function(response) {
        caches.open(CACHE_VERSION).then(function(cache) {
          cache.put(event.request, response.clone());
        });
        return response;
      });
    }).catch(function() {
      return caches.match('/resources/beach_dinner.jpg');       //Fallback image, should be available
    })
  );
});

