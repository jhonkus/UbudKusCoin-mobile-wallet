import {ScaledSheet} from 'react-native-size-matters';

const styleSheet = () =>
  ScaledSheet.create({
    container: {
      flex: 1,
      padding: 16,
      justifyContent: 'flex-start',
      alignItems: 'center',
    },
    label: {
      fontSize: 18,
      marginTop: 20,
    },
    address: {marginTop: 10, marginBottom: 30},
    show: {marginTop: 30},
    btnBox: {
      flexDirection: 'row',
      marginTop: 20,
      justifyContent: 'space-between',
    },
    btn: {
      borderWidth: 1,
      padding: 10,
      marginHorizontal: 10,
    },
    icon: {
      width: 32,
      height: 32,
    },
    space: {
      width: 40,
    },
  });

export default styleSheet;
