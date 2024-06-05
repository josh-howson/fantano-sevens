self.addEventListener('install', event => {
  console.log('Service worker installed');
});

self.addEventListener('fetch', function(event) {
  if (event.request.url.startsWith(self.location.origin)) {
    // Handle requests for own origin
    event.respondWith(
      caches.match(event.request).then(function(response) {
        return response || fetch(event.request);
      })
    );
  } else {
    // Ignore requests to external domains
    event.respondWith(fetch(event.request));
  }
});
