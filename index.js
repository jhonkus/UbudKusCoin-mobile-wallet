/**
 * @format
 */
import {AppRegistry} from 'react-native';
import React from 'react';
import App from './App';
import {name as appName} from './app.json';
import {Provider as StoreProvider} from 'react-redux';
import mixReducer from './src/reducers';
import {createStore} from 'redux';
const appStore = createStore(mixReducer);

const AppContainer = () => (
  <StoreProvider store={appStore}>
    <App />
  </StoreProvider>
);

AppRegistry.registerComponent(appName, () => AppContainer);
