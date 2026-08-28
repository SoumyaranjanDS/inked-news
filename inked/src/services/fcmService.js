import {
  getMessaging,
  requestPermission,
  getToken,
  onTokenRefresh,
  onMessage,
  setBackgroundMessageHandler,
  AuthorizationStatus
} from '@react-native-firebase/messaging';
import { Platform, PermissionsAndroid } from 'react-native';
import { safeFetch } from '../config/api';

/**
 * Requests permission for notifications (required for iOS and Android 13+)
 */
export async function requestUserPermission() {
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
    );
    if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
      console.log('❌ FCM Permission rejected by Android popup');
      return false;
    }
  }

  const messagingInstance = getMessaging();
  const authStatus = await requestPermission(messagingInstance);
  const enabled =
    authStatus === AuthorizationStatus.AUTHORIZED ||
    authStatus === AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('✅ FCM Authorization status:', authStatus);
    return true;
  }
  console.log('❌ FCM Permission rejected');
  return false;
}

/**
 * Retrieves the FCM token and sends it to the backend for the current user
 */
export async function getFCMToken(userId = null) {
  try {
    const hasPermission = await requestUserPermission();
    if (!hasPermission) return null;

    // Get the device token
    const token = await getToken(getMessaging());
    console.log('🔥 FCM Token:', token);

    // Send it to the backend
    await registerDeviceWithBackend(token, userId);

    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

/**
 * Sends the FCM token to the backend
 */
async function registerDeviceWithBackend(token, userId) {
  try {
    const response = await safeFetch('/api/notifications/register-device', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token,
        platform: Platform.OS,
        userId: userId || 'guest',
      }),
    });

    const data = await response.json();
    if (data.success) {
      console.log('✅ FCM Token successfully registered with backend!');
    } else {
      console.error('❌ Failed to register FCM token with backend:', data.error);
    }
  } catch (error) {
    console.error('❌ Network error while registering FCM token:', error);
  }
}

/**
 * Displays a real system notification using Notifee (works in foreground too)
 */
async function displayLocalNotification(remoteMessage) {
  const notifee = require('@notifee/react-native').default;
  const AndroidImportance = require('@notifee/react-native').AndroidImportance;

  // Create a channel (required for Android 8+)
  const channelId = await notifee.createChannel({
    id: 'inked_default',
    name: 'Inked News Alerts',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });

  await notifee.displayNotification({
    title: remoteMessage.notification?.title || 'Inked News',
    body: remoteMessage.notification?.body || '',
    data: remoteMessage.data || {},
    android: {
      channelId,
      smallIcon: 'ic_launcher', // uses the existing app launcher icon
      color: '#D32F2F',         // red tint on the icon badge
      pressAction: { id: 'default' },
      importance: AndroidImportance.HIGH,
    },
  });
}

/**
 * Sets up listeners for foreground messages and token refreshes
 */
export function setupFCMListeners(userId = null) {
  const messagingInstance = getMessaging();

  // Listen to token refreshes
  const unsubscribeTokenRefresh = onTokenRefresh(messagingInstance, (newToken) => {
    console.log('🔥 FCM Token Refreshed:', newToken);
    registerDeviceWithBackend(newToken, userId);
  });

  // Listen to foreground messages — display as real system notification
  const unsubscribeForeground = onMessage(messagingInstance, async (remoteMessage) => {
    console.log('🔔 Foreground Notification Received!', remoteMessage);
    try {
      await displayLocalNotification(remoteMessage);
    } catch (err) {
      console.error('Notifee display error:', err);
    }
  });

  return () => {
    unsubscribeTokenRefresh();
    unsubscribeForeground();
  };
}


/**
 * Handles background/quit state messages.
 * MUST be called at the root of the app (e.g. index.js or App.jsx outside components)
 */
export function registerBackgroundHandler() {
  console.log('--- Registering Background Handler (Modular API) ---');
  try {
    const messagingInstance = getMessaging();
    setBackgroundMessageHandler(messagingInstance, async (remoteMessage) => {
      console.log('🌙 Background/Quit Notification Received!', remoteMessage);
    });
  } catch (e) {
    console.error('CRASH AVOIDED in registerBackgroundHandler:', e);
  }
}
