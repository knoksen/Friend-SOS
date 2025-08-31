import { Express } from 'express';
import webpush from 'web-push';
import {
  createMockSubscription,
  registerSubscription,
  sendEmergencyAlert,
  sendCheckInReminder,
  unregisterSubscription,
  getHealthStatus,
  MockPushSubscription
} from './utils';

// Mock web-push sendNotification
jest.mock('web-push', () => ({
  ...jest.requireActual('web-push'),
  sendNotification: jest.fn().mockResolvedValue(undefined)
}));

describe('Push Notification Server', () => {
  let app: Express;
  let mockSubscription: MockPushSubscription;

  beforeAll(() => {
    // Set up VAPID for tests
    process.env.VAPID_PUBLIC_KEY = webpush.generateVAPIDKeys().publicKey;
    process.env.VAPID_PRIVATE_KEY = webpush.generateVAPIDKeys().privateKey;
    
    // Import app after setting environment variables
    app = require('../index').default;
  });

  beforeEach(() => {
    mockSubscription = createMockSubscription();
    jest.clearAllMocks();
  });

  describe('Subscription Management', () => {
    it('should register a new push subscription', async () => {
      const response = await registerSubscription(app, mockSubscription);
      expect(response.body.message).toBe('Subscription registered successfully');
    });

    it('should unregister an existing subscription', async () => {
      await registerSubscription(app, mockSubscription);
      const response = await unregisterSubscription(app, mockSubscription);
      expect(response.body.message).toBe('Subscription unregistered successfully');
    });

    it('should reject invalid subscription registration', async () => {
      const invalidSubscription = { endpoint: '' };
      const response = await request(app)
        .post('/api/push/register')
        .send(invalidSubscription)
        .expect(400);
      expect(response.body.error).toBe('Invalid subscription');
    });
  });

  describe('Emergency Alerts', () => {
    beforeEach(async () => {
      await registerSubscription(app, mockSubscription);
    });

    it('should send emergency alert to all subscribers', async () => {
      const message = 'Emergency test message';
      const response = await sendEmergencyAlert(app, message);
      
      expect(response.body.successful).toBe(1);
      expect(response.body.failed).toBe(0);
      expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
    });

    it('should handle failed notifications and remove invalid subscriptions', async () => {
      (webpush.sendNotification as jest.Mock).mockRejectedValueOnce(new Error('Invalid subscription'));
      
      const message = 'Emergency test message';
      const response = await sendEmergencyAlert(app, message);
      
      expect(response.body.successful).toBe(0);
      expect(response.body.failed).toBe(1);
      
      // Verify subscription was removed
      const health = await getHealthStatus(app);
      expect(health.body.subscriptions).toBe(0);
    });
  });

  describe('Check-in Reminders', () => {
    beforeEach(async () => {
      await registerSubscription(app, mockSubscription);
    });

    it('should send check-in reminder to subscribers', async () => {
      const userId = 'test-user';
      const response = await sendCheckInReminder(app, userId);
      
      expect(response.body.successful).toBe(1);
      expect(response.body.failed).toBe(0);
      expect(webpush.sendNotification).toHaveBeenCalledTimes(1);
    });

    it('should require userId for check-in reminders', async () => {
      const response = await request(app)
        .post('/api/push/send-checkin')
        .send({})
        .expect(400);
      
      expect(response.body.error).toBe('User ID is required');
    });
  });

  describe('Health Check', () => {
    it('should return server health status', async () => {
      const response = await getHealthStatus(app);
      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('subscriptions');
    });
  });
});
