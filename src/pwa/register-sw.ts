const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register('/service-worker.js', {
        scope: '/'
      });

      // Check for updates on page load
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update prompt
              showUpdatePrompt();
            }
          });
        }
      });

      // Set up periodic sync for check-ins if supported
      if ('periodicSync' in registration) {
        const status = await navigator.permissions.query({
          name: 'periodic-background-sync' as PermissionName
        });

        if (status.state === 'granted') {
          try {
            await (registration as any).periodicSync.register('check-in', {
              minInterval: 12 * 60 * 60 * 1000 // 12 hours
            });
          } catch (error) {
            console.log('Periodic sync could not be registered:', error);
          }
        }
      }

      // Set up push notifications if supported
      if ('PushManager' in window) {
        try {
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.VITE_VAPID_PUBLIC_KEY || '')
          });

          // Send the subscription to your server
          await fetch('/api/push/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(subscription)
          });
        } catch (error) {
          console.log('Push subscription failed:', error);
        }
      }

      console.log('Service Worker registered successfully:', registration.scope);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Helper function to show update prompt
const showUpdatePrompt = () => {
  // Create a custom modal/notification for update prompt
  const updatePrompt = document.createElement('div');
  updatePrompt.className = 'update-prompt';
  updatePrompt.innerHTML = `
    <div class="update-prompt-content">
      <h3>New Update Available</h3>
      <p>A new version of Friend SOS is available. Would you like to update now?</p>
      <button id="update-button">Update Now</button>
      <button id="update-later">Later</button>
    </div>
  `;

  document.body.appendChild(updatePrompt);

  // Handle update button click
  document.getElementById('update-button')?.addEventListener('click', () => {
    window.location.reload();
  });

  // Handle later button click
  document.getElementById('update-later')?.addEventListener('click', () => {
    updatePrompt.remove();
  });
};

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// Register the service worker
registerServiceWorker();
