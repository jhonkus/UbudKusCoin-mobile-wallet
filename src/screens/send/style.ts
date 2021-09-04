import {ScaledSheet} from 'react-native-size-matters';

const styleSheet = () =>
  ScaledSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    textInput: {
      height: 40,
      borderColor: '#000000',
      borderWidth: 1,
      paddingLeft: 10,
      paddingRight: 10,
      marginBottom: 10,
    },
    btnContinue: {
      backgroundColor: '#22577A',
      paddingLeft: 10,
      paddingRight: 10,
      marginTop: 10,
      width: 350,
    },
    btnClear: {
      backgroundColor: '#cccccc',
      paddingLeft: 10,
      paddingRight: 10,
      marginTop: 10,
      width: 350,
    },
    row: {
      flexDirection: 'column',
      marginBottom: 15,
    },
    txtContinue: {
      fontSize: 16,
      textAlign: 'center',
      margin: 10,
      color: '#ffffff',
    },
    txtCancel: {
      fontSize: 16,
      textAlign: 'center',
      margin: 10,
      color: '#000000',
    },
    from: {
      padding: 10,
      borderWidth: 1,
      borderColor: '#000000',
    },
    label: {
      marginBottom: 4,
      fontSize: 16,
    },
    btnBox: {
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default styleSheet;
