import { Platform, PermissionsAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MAIN_BACKEND_URL } from '../config/api';

const FCM_TOKEN_KEY = '@inked_fcm_token';

/**
 * Request notification permissions on Android (Android 13+ POST_NOTIFICATIONS) and iOS
 */
export const requestNotificationPermission = async () => {
  try {
    if (Platform.OS === 'android' && Platform.Version >= 33) {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
        {
          title: 'Inked Breaking News Alerts',
          message: 'Enable notifications to receive instant updates on breaking world and technology stories.',
          buttonPositive: 'Allow',
          buttonNegative: 'Later',
        }
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  } catch (err) {
    console.error('Permission request error:', err);
    return false;
  }
};

/**
 * Register FCM device token with the backend server
 */
export const registerDeviceTokenWithBackend = async (fcmToken, userId = null) => {
  if (!fcmToken) return;

  try {
    await AsyncStorage.setItem(FCM_TOKEN_KEY, fcmToken);

    await fetch(`${MAIN_BACKEND_URL}/api/notifications/register-device`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token: fcmToken,
        platform: Platform.OS,
        userId: userId,
        topics: ['breaking', 'technology', 'world'],
      }),
    });
    console.log('✅ FCM Device token registered with backend');
  } catch (e) {
    console.log('FCM token backend registration error:', e.message);
  }
};
