/**
 * public/sw.js
 *
 * Viking-APP PWA Service Worker for WebPush Notifications.
 * Intercepts live push events via VAPID, renders native OS/device notifications,
 * and handles notification click routing back into the active PWA view.
 */

self.addEventListener("push", function (event) {
  if (!event.data) return;

  let data;
  try {
    data = event.data.json();
  } catch {
    data = {
      title: "Viking-APP",
      body: event.data.text(),
      targetUrl: "/status",
    };
  }

  const title = data.title || "Viking-APP: Actualización de Orden";
  const options = {
    body: data.body || "Tienes una nueva actualización en tu orden de reparación.",
    icon: "/window.svg",
    badge: "/globe.svg",
    vibrate: [100, 50, 100],
    data: {
      targetUrl: data.targetUrl || "/status",
      timestamp: data.timestamp || Date.now(),
    },
  };

  event.waitUntil(
    self.registration.showNotification(title, options).then(() => {
      // Broadcast to any open PWA client window to instantly refresh the notification bell counter
      return self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientsList) => {
        clientsList.forEach((client) => {
          client.postMessage({
            type: "NEW_PUSH_NOTIFICATION",
            payload: data,
          });
        });
      });
    })
  );
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();

  const targetUrl = event.notification.data?.targetUrl || "/status";

  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (clientList) {
      // If PWA is already open in a tab, focus it and navigate if needed
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];
        if ("focus" in client) {
          return client.focus().then(() => {
            if ("navigate" in client && client.url !== targetUrl) {
              return client.navigate(targetUrl);
            }
            return client;
          });
        }
      }
      // If no open PWA window exists, launch a new window pointing to the target URL
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
