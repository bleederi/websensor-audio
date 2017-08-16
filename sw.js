const CACHE_VERSION = 1;
const APP_NAME = 'websensor-audio';

self.addEventListener('install', function(event) {
//Caching
  event.waitUntil(
    caches.open(CACHE_VERSION.toString()).then(function(cache) {
      return cache.addAll([
        'index.html',
        APP_NAME + '/scripts/app.js',
        APP_NAME + '/resources/beach_dinner.jpg',
        APP_NAME + '/resources/ocean.mp3',
      ]);
    })
  );
});

this.addEventListener('fetch', function(event) {
//Retrieval from cache
  event.respondWith(
    caches.match(event.request).then(function(resp) {
      return resp || fetch(event.request).then(function(response) {
        caches.open(CACHE_VERSION.toString()).then(function(cache) {
          cache.put(event.request, response.clone());
        });
        return response;
      });
    }).catch(function() {
      return caches.match(APP_NAME + '/resources/beach_dinner.jpg');       //Fallback image, should be available
    })
  );
});

