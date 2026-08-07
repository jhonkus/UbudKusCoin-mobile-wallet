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
import {WalletSession} from '../../../wallet/WalletSession';

type NewWalletProps = {
  navigation: {navigate: (screen: string) => void};
};

export const NewWallet = ({navigation}: NewWalletProps) => {
  const [generateDisabled, setGenerateDisabled] = useState(false);
  const [words, setWords] = useState('');
  const [arrayWords, setArrayWords] = useState<string[]>([]);

  const _regenerate = () => {
    try {
      setGenerateDisabled(true);
      const plainText = ethers.utils.entropyToMnemonic(
        ethers.utils.randomBytes(16),
      );
      if (!ethers.utils.isValidMnemonic(plainText)) {
        throw new Error('Generated seed phrase failed validation. Please regenerate.');
      }
      const wordsArray = plainText.split(' ');
      setWords(plainText);
      setArrayWords(wordsArray);
      WalletSession.beginSetup(plainText);
    } finally {
      setGenerateDisabled(false);
    }
  };

  useEffect(() => {
    _regenerate();
  }, []);

  const _copy = () => {
    Clipboard.setString(words);
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
            onPress={() => {
              WalletSession.beginSetup(words);
              navigation.navigate('BackupQuiz', {mnemonic: words});
            }}>
            <Text style={styles.btnLabel}>Continue</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};
