import React, {useEffect, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {createNavigationContainerRef, NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {Home} from './src/screens/home';
import {NewWallet, OpenWallet} from './src/screens/wallet';
import {Pin} from './src/screens/pin';
import {Dashboard} from './src/screens/dashboard';
import {TransactionDetail, Transactions} from './src/screens/transaction';
import {Receive} from './src/screens/receive';
import {Scan} from './src/screens/scan';
import {Buy} from './src/screens/buy';
import {Send, SendConfirmation, SendSuccess} from './src/screens/send';
import {WalletSession} from './src/wallet/WalletSession';
import {TransactionSummary} from './src/protocol';

type RootStackParamList = {
  Home: undefined;
  OpenWallet: undefined;
  NewWallet: undefined;
  Pin: {mode?: 'unlock'} | undefined;
  Dashboard: undefined;
  TransactionDetail: {tx: TransactionSummary} | undefined;
  Transactions: undefined;
  Receive: undefined;
  Scan: undefined;
  Buy: undefined;
  Send: {recipient?: string} | undefined;
  SendConfirmation: {recipient?: string; amount?: string; fee?: string} | undefined;
  SendSuccess: {txId?: string} | undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

/**
 * Automatically locks the wallet when the app enters the background and
 * redirects to the PIN unlock screen when it returns to the foreground
 * (but only if a wallet was previously set up and is now locked).
 */
function useAppLock() {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (appState.current.match(/active/) && !nextAppState.match(/active/)) {
        WalletSession.lock();
      }
      appState.current = nextAppState;
      if (
        nextAppState === 'active' &&
        navigationRef.isReady() &&
        WalletSession.hasActiveWallet() &&
        !WalletSession.isUnlocked()
      ) {
        navigationRef.navigate('Pin', {mode: 'unlock'});
      }
    };
    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, []);
}

const App = () => {
  useAppLock();
  return (
    <>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator>
          <Stack.Screen
            name="Home"
            component={Home}
            options={{title: '', headerShown: false}}
          />
          <Stack.Screen name="OpenWallet" component={OpenWallet} />
          <Stack.Screen
            name="NewWallet"
            component={NewWallet}
            options={{title: 'New Wallet'}}
          />
          <Stack.Screen
            name="Pin"
            component={Pin}
            options={{title: 'Input PIN'}}
          />
          <Stack.Screen
            name="Dashboard"
            component={Dashboard}
            options={{title: 'Dashboard', headerShown: false}}
          />
          <Stack.Screen
            name="TransactionDetail"
            component={TransactionDetail}
            options={{title: 'Transaction Detail'}}
          />
          <Stack.Screen
            name="Receive"
            component={Receive}
            options={{title: 'Receive'}}
          />
          <Stack.Screen
            name="Scan"
            component={Scan}
            options={{title: 'Scan'}}
          />
          <Stack.Screen name="Buy" component={Buy} options={{title: 'Buy'}} />
          <Stack.Screen
            name="Send"
            component={Send}
            options={{title: 'Send'}}
          />
          <Stack.Screen
            name="Transactions"
            component={Transactions}
            options={{title: 'Transactions'}}
          />
          <Stack.Screen
            name="SendConfirmation"
            component={SendConfirmation}
            options={{title: 'Send Confirmation'}}
          />
          <Stack.Screen
            name="SendSuccess"
            component={SendSuccess}
            options={{title: 'Send Success', headerShown: false}}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default App;
