import {ScaledSheet} from 'react-native-size-matters';

const styleSheet = () =>
  ScaledSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    itemLabel: {
      fontSize: 16,
    },
    itemValue: {
      fontSize: 14,
      fontWeight: 'bold',
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
      paddingVertical: 12,
      paddingHorizontal: 15,
      marginBottom: 8,
    },
    btnContinue: {
      backgroundColor: '#22577A',
      padding: 12,
      width: '90%',
    },
    btnBox: {
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    txtContinue: {
      fontSize: 16,
      textAlign: 'center',
      color: '#ffffff',
    },
  });

export default styleSheet;
