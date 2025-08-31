import express, { Request, Response } from 'express';
import cors from 'cors';
import webpush from 'web-push';
import dotenv from 'dotenv';
import { join } from 'path';

interface PushSubscriptionRequest {
  endpoint: string;
  keys: {
    auth: string;
    p256dh: string;
  };
}

interface EmergencyAlert {
  message: string;
  location?: {
    latitude: number;
    longitude: number;
    accuracy?: number;
  };
  contact?: string;
}

interface CheckInRequest {
  userId: string;
  checkInInterval?: number;
}

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();

// Initialize VAPID
if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
  console.error('VAPID keys are not set. Please run npm run generate-vapid first.');
  process.exit(1);
}

webpush.setVapidDetails(
  'mailto:support@friend-sos.app',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// Store subscriptions in memory (use a database in production)
const subscriptions = new Set<webpush.PushSubscription>();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.post('/api/push/register', (req: Request<{}, {}, PushSubscriptionRequest>, res: Response) => {
  const subscription = req.body;
  
  // Validate subscription
  if (!subscription || !subscription.endpoint) {
    return res.status(400).json({ error: 'Invalid subscription' });
  }

  // Store subscription
  subscriptions.add(subscription);
  
  res.status(201).json({ message: 'Subscription registered successfully' });
});

app.post('/api/push/unregister', (req: Request<{}, {}, PushSubscriptionRequest>, res: Response) => {
  const subscription = req.body;
  
  // Remove subscription
  subscriptions.delete(subscription);
  
  res.status(200).json({ message: 'Subscription unregistered successfully' });
});

// Send emergency alert to all subscribed devices
app.post('/api/push/send-emergency', async (req: Request<{}, {}, EmergencyAlert>, res: Response) => {
  const { message, location, contact } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const notification = {
    title: 'Emergency Alert!',
    message,
    location,
    contact,
    timestamp: new Date().toISOString()
  };

  const failed = new Set<webpush.PushSubscription>();

  // Send to all subscriptions
  await Promise.all(
    Array.from(subscriptions).map(async (subscription) => {
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify(notification)
        );
      } catch (error) {
        console.error('Failed to send notification:', error);
        failed.add(subscription);
      }
    })
  );

  // Remove failed subscriptions
  failed.forEach(sub => subscriptions.delete(sub));

  res.status(200).json({
    message: 'Emergency alert sent',
    successful: subscriptions.size - failed.size,
    failed: failed.size
  });
});

// Send check-in reminder
app.post('/api/push/send-checkin', async (req: Request<{}, {}, CheckInRequest>, res: Response) => {
  const { userId, checkInInterval } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'User ID is required' });
  }

  const notification = {
    title: 'Check-in Reminder',
    message: 'Time to check in! Please confirm your status.',
    userId,
    checkInInterval,
    timestamp: new Date().toISOString()
  };

  const failed = new Set<webpush.PushSubscription>();

  // Send to all subscriptions for this user
  await Promise.all(
    Array.from(subscriptions).map(async (subscription) => {
      try {
        await webpush.sendNotification(
          subscription,
          JSON.stringify(notification)
        );
      } catch (error) {
        console.error('Failed to send check-in notification:', error);
        failed.add(subscription);
      }
    })
  );

  // Remove failed subscriptions
  failed.forEach(sub => subscriptions.delete(sub));

  res.status(200).json({
    message: 'Check-in reminder sent',
    successful: subscriptions.size - failed.size,
    failed: failed.size
  });
});

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'healthy',
    subscriptions: subscriptions.size
  });
});

// Start server
const PORT = process.env.PORT || 3001;

// Only start the server if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Push notification server running on port ${PORT}`);
  });
}

export default app;
