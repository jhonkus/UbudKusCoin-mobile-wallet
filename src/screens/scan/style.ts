import {ScaledSheet} from 'react-native-size-matters';

const styleSheet = () =>
  ScaledSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    closeButton: {
      position: 'absolute',
      top: 16,
      left: 16,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: 'rgba(255,255,255,0.9)',
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    },
    icon: {
      width: 24,
      height: 24,
      marginRight: 4,
    },
    centered: {
      alignItems: 'center',
      justifyContent: 'center',
    },
  });

export default styleSheet;
