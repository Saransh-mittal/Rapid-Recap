self.addEventListener("push", (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
  });
});

self.addEventListener("notificationclick", function (event) {
  //console.log("On notification click: ", event.notification.tag);
  event.waitUntil(
    clients.openWindow("http://localhost:5173/article/6624a3058036eaa5636e0e88") // assuming `data.url` contains the URL to redirect to
  );
  event.notification.close();
});
