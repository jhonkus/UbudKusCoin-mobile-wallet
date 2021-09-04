import {ScaledSheet} from 'react-native-size-matters';

const styleSheet = () =>
  ScaledSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    btnAction: {
      padding: 20,
      justifyContent: 'space-around',
      margin: 5,
      borderRadius: 20,
      borderWidth: 1,
    },
    rowDtl: {
      borderRadius: 4,
      shadowColor: 'rgb(0, 0, 0)',
      shadowOffset: {
        width: 3,
        height: 3,
      },
      shadowOpacity: 0.5,
      shadowRadius: 5,
      elevation: 2,
      backgroundColor: 'white',
      paddingVertical: 8,
      paddingHorizontal: 15,
      marginBottom: 8,
    },
    itemLabel: {
      fontSize: 16,
    },
    itemValue: {
      fontSize: 14,
      fontWeight: 'bold',
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
      paddingVertical: 12,
      paddingHorizontal: 12,
      marginBottom: 8,
    },
    itemAddress: {
      fontSize: 16,
      color: '#22577A',
    },
    itemDate: {
      fontSize: 12,
    },
    itemAmmount: {
      fontSize: 16,
      color: '#22577A',
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
      paddingVertical: 10,
    },
    subLeft: {
      flex: 0.5,
    },
    subRight: {
      flex: 0.5,
      textAlign: 'right',
    },
  });

export default styleSheet;
