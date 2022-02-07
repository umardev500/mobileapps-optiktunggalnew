/**
 * @format
 */

<<<<<<< HEAD
import { AppRegistry } from 'react-native';
import App from './src/App';
import { name as appName } from './src/config.json';
 
=======
import { AppRegistry, LogBox } from 'react-native';
import App from './src/App';
import { name as appName } from './src/config.json';
 
LogBox.ignoreLogs(['Warning: ...']);
LogBox.ignoreAllLogs();
>>>>>>> origin/Develop
AppRegistry.registerComponent(appName, () => App);
