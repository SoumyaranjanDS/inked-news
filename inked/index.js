/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import { registerBackgroundHandler } from './src/services/fcmService';

// Register background handler early
registerBackgroundHandler();

AppRegistry.registerComponent(appName, () => App);
