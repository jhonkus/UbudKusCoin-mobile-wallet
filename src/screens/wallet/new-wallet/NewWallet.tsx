import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import IMAGES from '../../../../assets';
import styles from './style';
import {useState, useEffect} from 'react';
// Import the crypto getRandomValues shim (**BEFORE** the shims)
import 'react-native-get-random-values';

// Import the the ethers shims (**BEFORE** ethers)
import '@ethersproject/shims';

// Import the ethers library
import {ethers} from 'ethers';

import Clipboard from '@react-native-clipboard/clipboard';
import {useSelector, useDispatch} from 'react-redux';
import {mnemonicAction} from '../../../actions';
import Toast from 'react-native-toast-message';

export const NewWallet = ({navigation}) => {
  const [generateDisabled, setGenerateDisabled] = useState(false);
  const {words, arrayWords} = useSelector((state: any) => state.mnemonic);
  console.log({words});

  const dispatch = useDispatch();
  const updateMnemonic = (plainText: string, arrText: string[]) =>
    dispatch(mnemonicAction({words: plainText, arrayWords: arrText}));

  const _regenerate = () => {
    try {
      setGenerateDisabled(true);
      const plainText = ethers.utils.entropyToMnemonic(
        ethers.utils.randomBytes(16),
      );
      let uniqueWords = [...new Set(plainText?.split(' '))];
      uniqueWords.length = 12;
      updateMnemonic(plainText, uniqueWords);
    } finally {
      setGenerateDisabled(false);
    }
  };

  useEffect(() => {
    _regenerate();
  }, []);

  const _copy = () => {
    Clipboard.setString(words);
    Toast.show({
      type: 'success',
      text1: 'Copied',
      text2: 'Mnemonic copied to clipboard!',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container}>
        <Text style={styles.desc}>
          Your {arrayWords?.length} Words Seed Phrase
        </Text>
        <View style={styles.partTop}>
          {arrayWords?.map(data => (
            <View style={styles.box} key={data}>
              <Text style={styles.textSeed}>{data}</Text>
            </View>
          ))}
        </View>
        <View style={styles.btnBox}>
          <Pressable
            onPress={_copy}
            style={({pressed}) => [
              styles.btn,
              {
                backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white',
              },
              styles.wrapperCustom,
            ]}>
            <Image source={IMAGES.IconCopy} style={styles.icon} />
            <Text>Copy</Text>
          </Pressable>
          <Pressable
            onPress={_regenerate}
            disabled={generateDisabled}
            style={({pressed}) => [
              styles.btn,
              {
                backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'white',
              },
              styles.wrapperCustom,
            ]}>
            <Image source={IMAGES.IconGenerate} style={styles.icon} />
            <Text>Regenerate</Text>
          </Pressable>
        </View>
        <View style={styles.warningBox}>
          <Text style={styles.warningText}>WARNING!!</Text>
          <Text style={styles.noWarningText}>
            {
              "Don't tell anyone your seed phrase\nKeep it in a safe place\nLosing this phrase means you lose your money"
            }
          </Text>
        </View>

        <View style={styles.partBottom}>
          <TouchableOpacity
            style={[styles.btn, styles.btnNew]}
            onPress={() => navigation.navigate('Pin')}>
            <Text style={styles.btnLabel}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
