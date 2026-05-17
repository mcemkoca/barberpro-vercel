// BarberPro Service Worker
// Cache-first for static assets, network-first for dynamic content

const CACHE_NAME = 'barberpro-v1';
const STATIC_CACHE = 'barberpro-static-v1';

const STATIC_ASSETS = [
  '/barberpro-vercel/',
  '/barberpro-vercel/index.html',
  '/barberpro-vercel/login.html',
  '/barberpro-vercel/dashboard.html',
  '/barberpro-vercel/customer-portal.html',
  '/barberpro-vercel/barberpro-appointments.html',
  '/barberpro-vercel/barberpro-bookings.html',
  '/barberpro-vercel/barberpro-customers.html',
  '/barberpro-vercel/barberpro-inventory.html',
  '/barberpro-vercel/barberpro-loyalty.html',
  '/barberpro-vercel/barberpro-marketing.html',
  '/barberpro-vercel/barberpro-pos.html',
  '/barberpro-vercel/barberpro-reports.html',
  '/barberpro-vercel/barberpro-services.html',
  '/barberpro-vercel/barberpro-shifts.html',
  '/barberpro-vercel/barberpro-staff.html',
  '/barberpro-vercel/css/main.css',
  '/barberpro-vercel/css/components.css',
  '/barberpro-vercel/css/dashboard.css',
  '/barberpro-vercel/css/barberpro.css',
  '/barberpro-vercel/js/app.js',
  '/barberpro-vercel/js/pwa.js',
  '/barberpro-vercel/js/export.js',
  '/barberpro-vercel/manifest.json',
  '/barberpro-vercel/assets/icon-192.png',
  '/barberpro-vercel/assets/icon-512.png'
];

// Install — cache static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('[SW] Failed to cache some assets:', err);
        // Continue even if some assets fail
        return Promise.resolve();
      });
    })
  );
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== STATIC_CACHE && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch — cache-first for static, network-first for API/data
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and external URLs
  if (request.method !== 'GET' || !url.pathname.startsWith('/barberpro-vercel/')) {
    return;
  }

  // HTML pages — network first, fallback to cache
  if (request.destination === 'document' || url.pathname.endsWith('.html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Offline fallback
            return new Response(
              '<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>BarberPro — Çevrimdışı</title><style>body{font-family:Inter,sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#0f172a;color:#e2e8f0;text-align:center;}</style></head><body><div><h1>✂️ Çevrimdışı Mod</h1><p>Bu sayfa daha önce ziyaret edilmemiş.<br>Lütfen internet bağlantınızı kontrol edin.</p><a href="/barberpro-vercel/index.html" style="color:#a855f7;text-decoration:none;">Ana Sayfaya Dön</a></div></body></html>',
              { headers: { 'Content-Type': 'text/html' } }
            );
          });
        })
    );
    return;
  }

  // Static assets (CSS, JS, images, fonts) — cache first
  if (
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'image' ||
    request.destination === 'font' ||
    url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|woff2?|ttf)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Default — network with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// Background Sync placeholder
self.addEventListener('sync', (event) => {
  if (event.tag === 'barberpro-sync') {
    event.waitUntil(
      self.clients.matchAll({ type: 'window' }).then((clients) => {
        clients.forEach((client) => client.postMessage({ type: 'SYNC_COMPLETE' }));
      })
    );
  }
});

// Push notification placeholder
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    event.waitUntil(
      self.registration.showNotification(data.title || 'BarberPro', {
        body: data.body || 'Yeni bildirim',
        icon: '/barberpro-vercel/assets/icon-192.png',
        badge: '/barberpro-vercel/assets/icon-72.png',
        tag: data.tag || 'barberpro-default'
      })
    );
  }
});
