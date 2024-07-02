const RapidRecapLogo = "./images/rr.png";

self.addEventListener("push", (event) => {
  const data = event.data.json();
  //console.log("Push received", data);
  const notificationOptions = {
    body: data.body,
    icon: data.icon || RapidRecapLogo,
    image: data.image || null,
    data: { url: data.url }, // Pass additional data
  };
  self.registration.showNotification(data.title, notificationOptions);
});

self.addEventListener("notificationclick", function (event) {
  const notificationData = event.notification.data;

  if (notificationData && notificationData.url) {
    event.waitUntil(clients.openWindow(notificationData.url));
  }
  event.notification.close();
});
