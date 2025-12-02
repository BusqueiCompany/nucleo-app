const CACHE_NAME = 'busquei-v1.0.0';
const RUNTIME_CACHE = 'busquei-runtime';

// Arquivos essenciais para pré-cache
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/icon-192.png',
  '/icon-512.png',
  '/offline.html'
];

// Instalação - pré-cache de arquivos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Pré-cache de arquivos essenciais');
        return cache.addAll(PRECACHE_URLS.filter(url => url !== '/offline.html'));
      })
      .then(() => self.skipWaiting())
  );
});

// Ativação - limpar caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE)
          .map((cacheName) => {
            console.log('[SW] Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch - estratégias de cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requests não-HTTP
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // Ignorar API calls do Supabase (sempre usar network)
  if (url.hostname.includes('supabase')) {
    return;
  }

  // Estratégia: Cache First para assets (JS, CSS, imagens, fontes)
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'image' ||
    request.destination === 'font'
  ) {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }

        return caches.open(RUNTIME_CACHE).then((cache) => {
          return fetch(request).then((response) => {
            // Cache apenas respostas válidas
            if (response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      }).catch(() => {
        // Fallback para imagens offline
        if (request.destination === 'image') {
          return caches.match('/icon-192.png');
        }
      })
    );
    return;
  }

  // Estratégia: Network First para páginas HTML
  if (request.destination === 'document') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cache a página para acesso offline
          const responseClone = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // Tentar buscar do cache
          return caches.match(request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // Página offline genérica
            return caches.match('/');
          });
        })
    );
    return;
  }

  // Para outros requests, tentar network first
  event.respondWith(
    fetch(request)
      .then((response) => {
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Mensagens do cliente
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
