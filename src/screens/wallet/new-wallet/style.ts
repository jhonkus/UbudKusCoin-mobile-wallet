import {StyleSheet} from 'react-native';

export default StyleSheet.create({
  container: {
    padding: 12,
    flex: 1,
  },
  partTop: {
    justifyContent: 'center',
    marginVertical: 30,
    flexDirection: 'row',
    paddingVertical: 10,
    flexWrap: 'wrap',
    backgroundColor: '#ffffff',
  },
  partBottom: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  textSeed: {
    color: '#4B6587',
    fontSize: 16,
  },
  warningBox: {
    padding: 10,
    borderWidth: 1,
    borderRadius: 6,
    borderColor: '#cccccc',
    marginBottom: 40,
    backgroundColor: '#ffffff',
  },
  warningText: {
    color: 'red',
    fontSize: 16,
  },
  noWarningText: {
    fontSize: 16,
  },
  btnBox: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },

  btn: {
    padding: 6,
    borderWidth: 1,
    marginHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  btnNew: {
    backgroundColor: '#22577A',
    paddingHorizontal: 30,
    width: '100%',
    justifyContent: 'center',
  },

  btnLabel: {
    textAlign: 'center',
    color: '#ffffff',
    fontSize: 18,
  },
  box: {
    padding: 10,
    marginHorizontal: 5,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: '#cccccc',
  },
  desc: {
    textAlign: 'center',
    fontSize: 18,
  },
  icon: {
    width: 32,
    height: 32,
  },
  wrapperCustom: {
    borderRadius: 8,
    padding: 6,
  },
});
