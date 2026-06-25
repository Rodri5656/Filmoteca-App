const CACHE_NAME = 'filmoteca-offline-v1';
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './script_Rodrigo.js',
  './manifest.json'
];

// Instalación y almacenamiento en caché de los archivos estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cacheando archivos de la filmoteca');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Fuerza a la versión nueva a tomar el control sin esperar
  );
});

// Activación y limpieza de cachés antiguas
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Estrategia: Buscar en caché primero, si no está, ir a la red
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        return response || fetch(event.request);
      })
  );
});