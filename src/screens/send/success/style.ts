import {ScaledSheet} from 'react-native-size-matters';

const styleSheet = () =>
  ScaledSheet.create({
    container: {
      padding: 16,
      flex: 1,
      flexDirection: 'column',
    },
    partTop: {
      flex: 0.6,
      justifyContent: 'space-around',
      alignItems: 'center',
    },
    partBottom: {
      flex: 0.4,
      position: 'relative',
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    logo: {
      width: 200,
      height: 200,
    },
    btn: {
      paddingHorizontal: 8,
      paddingVertical: 6,
      borderRadius: 10,
      marginHorizontal: '1%',
      marginBottom: 10,
      minWidth: '80%',
      height: 40,
      textAlign: 'center',
      borderWidth: 0,
    },

    btnNew: {backgroundColor: '#22577A'},
    btnOpen: {backgroundColor: '#38A3A5'},

    btnLabel: {
      textAlign: 'center',
      color: '#ffffff',
      fontSize: 18,
    },
    desc: {
      textAlign: 'center',
      fontSize: 18,
    },
  });

export default styleSheet;
