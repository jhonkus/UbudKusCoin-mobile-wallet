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

export const NewWallet = ({navigation}) => {
  const [mnemonic, setMnemonic] = useState<string>();
  const [arrayWords, setArrayWords] = useState<string[]>();
  const [copiedText, setCopiedText] = useState('');

  const _regenerate = async () => {
    try {
      const text = ethers.utils.entropyToMnemonic(ethers.utils.randomBytes(16));
      setMnemonic(text);
      const words = text?.trim().split(' ');
      setArrayWords(words);
      console.log('== araray words: ', arrayWords);
    } catch (e) {}
  };

  useEffect(() => {
    _regenerate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _copy = () => {
    console.log('=== copy ');
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
