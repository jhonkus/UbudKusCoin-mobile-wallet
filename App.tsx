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
import {AddressBook} from './src/screens/addressbook/AddressBook';
import {Settings} from './src/screens/settings/Settings';
import {BackupQuiz} from './src/screens/wallet/BackupQuiz';
import {Staking} from './src/screens/staking/Staking';
import {OnboardingScreen} from './src/presentation/screens/OnboardingScreen';
import {PortfolioDashboardScreen} from './src/presentation/screens/PortfolioDashboardScreen';
import {ImportWalletScreen} from './src/presentation/screens/ImportWalletScreen';
import {WalletProvider} from './src/presentation/context/WalletContext';
import {ToastProvider} from './src/presentation/context/ToastContext';
import {WalletSession} from './src/wallet/WalletSession';
import {TransactionSummary} from './src/protocol';

type RootStackParamList = {
  Home: undefined;
  Onboarding: undefined;
  ImportWallet: undefined;
  OpenWallet: undefined;
  NewWallet: undefined;
  BackupQuiz: {mnemonic: string} | undefined;
  Pin: {mode?: 'unlock' | 'create'} | undefined;
  Dashboard: undefined;
  Portfolio: undefined;
  TransactionDetail: {tx: TransactionSummary} | undefined;
  Transactions: undefined;
  Receive: undefined;
  Scan: undefined;
  Buy: undefined;
  Send: {recipient?: string} | undefined;
  SendConfirmation: {recipient?: string; amount?: string; fee?: string} | undefined;
  SendSuccess: {txId?: string} | undefined;
  AddressBook: {mode?: 'picker'} | undefined;
  Settings: undefined;
  Staking: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const navigationRef = createNavigationContainerRef<RootStackParamList>();

function useAppLock() {
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    WalletSession.init();
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

const AppContent = () => {
  useAppLock();
  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={Home}
          options={{title: '', headerShown: false}}
        />
        <Stack.Screen
          name="Onboarding"
          component={OnboardingScreen}
          options={{headerShown: false}}
        />
        <Stack.Screen
          name="ImportWallet"
          component={ImportWalletScreen}
          options={{title: 'Import Wallet'}}
        />
        <Stack.Screen name="OpenWallet" component={OpenWallet} />
        <Stack.Screen
          name="NewWallet"
          component={NewWallet}
          options={{title: 'New Wallet'}}
        />
        <Stack.Screen
          name="BackupQuiz"
          component={BackupQuiz}
          options={{title: 'Seed Verification'}}
        />
        <Stack.Screen
          name="Pin"
          component={Pin}
          options={{title: 'Input PIN'}}
        />
        <Stack.Screen
          name="Dashboard"
          component={PortfolioDashboardScreen}
          options={{title: 'Portfolio', headerShown: false}}
        />
        <Stack.Screen
          name="Portfolio"
          component={PortfolioDashboardScreen}
          options={{title: 'Portfolio', headerShown: false}}
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
        <Stack.Screen
          name="AddressBook"
          component={AddressBook}
          options={{title: 'Address Book'}}
        />
        <Stack.Screen
          name="Settings"
          component={Settings}
          options={{title: 'Settings & Diagnostics'}}
        />
        <Stack.Screen
          name="Staking"
          component={Staking}
          options={{title: 'Staking'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const App = () => {
  return (
    <ToastProvider>
      <WalletProvider>
        <AppContent />
      </WalletProvider>
    </ToastProvider>
  );
};

export default App;


