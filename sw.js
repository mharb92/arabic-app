self.addEventListener('push', function(e) {
  const data = e.data ? e.data.json() : {};
  e.waitUntil(
    self.registration.showNotification(data.title || 'Arabic Practice', {
      body: data.body || 'Time for your daily Arabic practice',
      icon: data.icon || '/arabic-app/icon-192.png',
      badge: data.badge || '/arabic-app/icon-192.png',
      data: { url: data.url || 'https://mharb92.github.io/arabic-app/arabic_mastery_app.html' }
    })
  );
});

self.addEventListener('notificationclick', function(e) {
  e.notification.close();
  e.waitUntil(clients.openWindow(e.notification.data.url));
});
