const staticCacheName = 'cc-static-v3';

// Default files to always cache
const cacheFiles = [
	'/',
	'/index.html',
	'/js/app.js',
	'/js/bootstrap.min.js',
	'/js/jquery-3.2.1.min.js',
	'/js/mdb.min.js',
	'/js/popper.min.js',    
	'/css/bootstrap.min.css',
	'/css/mdb.css',
	'/css/style.css',
	'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.css',
	'/font/roboto/Roboto-Bold.woff',
	'/font/roboto/Roboto-Bold.woff2',
	'/font/roboto/Roboto-Light.woff',
	'/font/roboto/Roboto-Light.woff2',
	'/font/roboto/Roboto-Regular.woff',
	'/font/roboto/Roboto-Regular.woff2',
	'/img/bg-gradient-sky.7ea325995978.png',
	'/img/grain.855f29e0c686.png'
    
];

self.addEventListener('install', function(e){
    console.log('[service worker] installed!');
                                             
    // e.waitUntil Delays the event until the Promise is resolved
    e.waitUntil(

    	// Open the cache
	    caches.open(staticCacheName).then(function(cache) {

	    	// Add all the default files to the cache
			console.log('ServiceWorker Starting Caching Files');
			return cache.addAll(cacheFiles);
	    })
); // end e.waitUntil                      
});

self.addEventListener('activate', function(e) {
    console.log('ServiceWorker Activated');

    e.waitUntil(
    	// Get all the cache keys from cacheName, loop through
		caches.keys().then(function(cacheNames) {
			return Promise.all(cacheNames.map(function(thisCacheName) {

				// If a cached item is saved under a previous cacheName
				if (thisCacheName !== staticCacheName) {

					// Delete that cached file
					console.log('[ServiceWorker] Removing Cached Files from Cache - ', thisCacheName);
					return caches.delete(thisCacheName);
				}
			}));
		})
	); // end e.waitUntil

});

self.addEventListener('fetch', function(event) {
    const requestUrl = new URL(event.request.url);
	console.log('[ServiceWorker] Fetch', event.request.url);
    
	// e.respondWidth Responds to the fetch event
	event.respondWith(

		// Check in cache for the request being made
		caches.match(event.request)
            .then(function(response) {
				// If the request is in the cache
				if ( response ) {
					console.log("[ServiceWorker] Found in Cache", event.request.url, response);
					// Return the cached version
					return response;
				}

                // If the request is NOT in the cache, fetch and cache
				var requestClone = event.request.clone();
				return fetch(requestClone)
					.then(function(response) {

						if ( !response ) {
							console.log("[ServiceWorker] No response from fetch ")
							return response;
						}

                        //clone network response(stream) for both adding to ache and returning
						var responseClone = response.clone();
                        
                    //  Open the cache
                    caches.open(staticCacheName).then(function(cache) {

							// Put the fetched network response in the cache
							cache.put(event.request, responseClone);
							console.log('[ServiceWorker] New Data Cached', event.request.url);

							// Return the response
							return response;
			
				        }); // end caches.open

					})
					.catch(function(err) {
						console.log('[ServiceWorker] Error Fetching & Caching New Data', err);
					});


			}) // end caches.match(e.request)
	); // end e.respondWith
});