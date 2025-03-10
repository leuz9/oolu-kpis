importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyDD59rXRknEslkf2b2Ca9w08j1aN3EWstU',
  authDomain: 'oolusolar-9f574.firebaseapp.com',
  projectId: 'oolusolar-9f574',
  storageBucket: 'oolusolar-9f574.firebaseapp.com',
  messagingSenderId: '690083719978',
  appId: '1:690083719978:web:a97fc596686682b3678c53',
  measurementId: 'G-V7TGJ49WSF'
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  const { title, body, icon } = payload.notification || {};
  
  if (!title) {
    return;
  }

  const notificationOptions = {
    body,
    icon: icon || '/vite.svg',
    badge: '/vite.svg',
    tag: 'notification'
  };

  self.registration.showNotification(title, notificationOptions);
});