import {ScaledSheet} from 'react-native-size-matters';

const styleSheet = () =>
  ScaledSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    accountInfo: {
      alignItems: 'center',
      justifyContent: 'center',
      height: 180,
      shadowColor: 'rgb(0, 0, 0)',
      shadowOffset: {
        width: 3,
        height: 3,
      },
      shadowOpacity: 0.5,
      shadowRadius: 5,
      elevation: 4,
      backgroundColor: '#22577A',
      padding: 10,
      marginBottom: 10,
      borderRadius: 10,
    },
    trxAddress: {
      fontSize: 18,
      color: '#000000',
    },
    balance: {
      marginTop: 20,
      fontSize: 34,
      color: '#ffffff',
    },
    address: {
      fontSize: 18,
      color: '#ffffff',
    },
    btnAction: {
      margin: 5,
      padding: 15,
    },
    btnBox: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      borderWidth: 1,
      borderRadius: 10,
      marginBottom: 15,
      marginTop: 15,
      elevation: 5,
      shadowColor: 'rgb(0, 0, 0)',
      shadowOffset: {
        width: 3,
        height: 3,
      },
      shadowOpacity: 0.5,
      shadowRadius: 5,
      backgroundColor: '#ffffff',
      zIndex: 0,
      marginHorizontal: 10,
    },
    name: {
      fontSize: 18,
      color: '#ffffff',
    },
    row: {
      borderRadius: 4,
      flexDirection: 'row',
      shadowColor: 'rgb(0, 0, 0)',
      shadowOffset: {
        width: 3,
        height: 3,
      },
      shadowOpacity: 0.5,
      shadowRadius: 5,
      elevation: 2,
      backgroundColor: 'white',
      padding: 16,
      marginBottom: 4,
    },
    itemAddress: {
      fontSize: 16,
      color: '#22577A',
    },
    itemDate: {
      fontSize: 10,
    },
    itemAmmount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#57CC99',
    },
    colLeft: {
      flex: 0.65,
    },
    colRight: {
      flex: 0.35,
      justifyContent: 'center',
      alignItems: 'flex-end',
    },
    btnLabel: {
      fontSize: 16,
    },
    btnSend: {},
    btnReceive: {},
    btnBuy: {},
    icon: {width: 32, height: 32},
    wrapperCustom: {
      padding: 0,
    },
    subtitle: {
      flexDirection: 'row',
      paddingVertical: 6,
    },
    subLeft: {
      flex: 0.5,
      justifyContent: 'center',
      height: 30,
    },
    subRight: {
      flex: 0.5,
      alignItems: 'flex-end',
      justifyContent: 'center',
      height: 30,
    },
    textRight: {
      textAlign: 'right',
      color: 'blue',
    },
    textLeft: {
      textAlign: 'left',
    },
  });

export default styleSheet;
