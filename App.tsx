import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
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
import Toast from 'react-native-toast-message';
const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <>
      <NavigationContainer>
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
      <Toast ref={ref => Toast.setRef(ref)} />
    </>
  );
};

export default App;
