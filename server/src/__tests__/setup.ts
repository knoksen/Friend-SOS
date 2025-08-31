import { config } from 'dotenv';
import { join } from 'path';
import webpush from 'web-push';

// Load test environment variables
config({ path: join(__dirname, '../../.env.test') });

// Generate test VAPID keys if not present
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  const vapidKeys = webpush.generateVAPIDKeys();
  process.env.VAPID_PUBLIC_KEY = vapidKeys.publicKey;
  process.env.VAPID_PRIVATE_KEY = vapidKeys.privateKey;
}

// Other test setup can go here
