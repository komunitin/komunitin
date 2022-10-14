import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { CacheFirst } from 'workbox-strategies';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { ExpirationPlugin } from 'workbox-expiration';
import { onBackgroundMessage, getMessaging } from "firebase/messaging/sw";
import { initializeApp } from 'firebase/app';
import firebaseConfig from '../src/plugins/FirebaseConfig';

// Precache generated manifest file.
precacheAndRoute((self as any).__WB_MANIFEST);

// JS and CSS and assets should be already precached so we don't need to do any
// runtime caching.

// Cache images with a Cache First strategy for maximum performance.
registerRoute(
  // Check to see if the request's destination is style for an image
  ({ request }) => request.destination === 'image',
  // Use a Cache First caching strategy
  new CacheFirst({
    // Put all cached files in a cache named 'images'
    cacheName: 'images',
    plugins: [
      // Ensure that only requests that result in a 200 status are cached
      new CacheableResponsePlugin({
        statuses: [200],
      }),
      // Don't cache more than 50 items, and expire them after 30 days
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 Days
      }),
    ],
  }),
);

// Setup push notifications handler.

// Initialize Firebase so we receive push notifications.
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Push Message handler. 
onBackgroundMessage(messaging, async (payload) => {
  // Do something with the message
})
