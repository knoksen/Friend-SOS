import webpush from 'web-push';
import fs from 'fs/promises';
import path from 'path';

async function generateVapidKeys() {
  const vapidKeys = webpush.generateVAPIDKeys();

  const envContent = `# VAPID Keys for Push Notifications
VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
VAPID_PRIVATE_KEY=${vapidKeys.privateKey}
`;

  // Write to .env in server directory
  await fs.writeFile(path.join(__dirname, '../../.env'), envContent);

  // Write to .env in root directory
  await fs.writeFile(path.join(__dirname, '../../../.env'), `# VAPID Keys
VITE_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}
`);

  console.log('VAPID Keys generated successfully!');
  console.log('Public Key:', vapidKeys.publicKey);
  console.log('Private Key:', vapidKeys.privateKey);
  console.log('\nKeys have been saved to .env files');
}

generateVapidKeys().catch(console.error);
