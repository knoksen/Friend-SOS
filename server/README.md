# Friend SOS Push Notification Server

This server handles push notifications for the Friend SOS Progressive Web App.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Generate VAPID keys:
```bash
npm run generate-vapid
```

3. Start the development server:
```bash
npm run dev
```

4. For production, build and start:
```bash
npm run build
npm start
```

## Environment Variables

The following environment variables are required:

- `PORT` - Server port (default: 3001)
- `VAPID_PUBLIC_KEY` - VAPID public key (generated)
- `VAPID_PRIVATE_KEY` - VAPID private key (generated)

## API Endpoints

### Register Push Subscription
- `POST /api/push/register`
- Body: Push Subscription object

### Unregister Push Subscription
- `POST /api/push/unregister`
- Body: Push Subscription object

### Send Emergency Alert
- `POST /api/push/send-emergency`
- Body:
  ```json
  {
    "message": "Emergency message",
    "location": {
      "latitude": number,
      "longitude": number,
      "accuracy": number
    },
    "contact": "Contact information"
  }
  ```

### Send Check-in Reminder
- `POST /api/push/send-checkin`
- Body:
  ```json
  {
    "userId": "user-id",
    "checkInInterval": 3600
  }
  ```

### Health Check
- `GET /health`
- Returns server status and subscription count
