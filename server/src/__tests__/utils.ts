import { Application } from 'express';
import request from 'supertest';
import webpush from 'web-push';

export interface MockPushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export const createMockSubscription = (): MockPushSubscription => ({
  endpoint: `https://fcm.googleapis.com/fcm/send/${Math.random().toString(36).substring(2)}`,
  keys: {
    p256dh: webpush.generateVAPIDKeys().publicKey,
    auth: Math.random().toString(36).substring(2)
  }
});

export const registerSubscription = async (app: Application, subscription: MockPushSubscription) => {
  return request(app)
    .post('/api/push/register')
    .send(subscription)
    .expect(201);
};

export const sendEmergencyAlert = async (app: Application, message: string) => {
  return request(app)
    .post('/api/push/send-emergency')
    .send({ message })
    .expect(200);
};

export const sendCheckInReminder = async (app: Application, userId: string) => {
  return request(app)
    .post('/api/push/send-checkin')
    .send({ userId })
    .expect(200);
};

export const unregisterSubscription = async (app: Application, subscription: MockPushSubscription) => {
  return request(app)
    .post('/api/push/unregister')
    .send(subscription)
    .expect(200);
};

export const getHealthStatus = async (app: Application) => {
  return request(app)
    .get('/health')
    .expect(200);
};
