import React, {useState, useEffect} from 'react';
import {View, Text, TextInput, Pressable, StyleSheet} from 'react-native';

export const BackupQuiz = ({navigation, route}: any) => {
  const mnemonic: string = route.params?.mnemonic ?? '';
  const words = mnemonic.trim().split(/\s+/);
  
  // Pick 2 random word indices to quiz (e.g. index 3 and 7)
  const [quizIndices, setQuizIndices] = useState<number[]>([]);
  const [input1, setInput1] = useState('');
  const [input2, setInput2] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (words.length >= 12) {
      const idx1 = 2; // Word #3
      const idx2 = 8; // Word #9
      setQuizIndices([idx1, idx2]);
    }
  }, [mnemonic]);

  const handleVerify = () => {
    setError('');
    if (quizIndices.length < 2) return;
    const target1 = words[quizIndices[0]].toLowerCase();
    const target2 = words[quizIndices[1]].toLowerCase();

    if (input1.trim().toLowerCase() !== target1) {
      return setError(`Word #${quizIndices[0] + 1} does not match.`);
    }
    if (input2.trim().toLowerCase() !== target2) {
      return setError(`Word #${quizIndices[1] + 1} does not match.`);
    }

    // Success! Proceed to PIN screen
    navigation.navigate('Pin', {mode: 'create'});
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Confirm Your Seed Phrase</Text>
      <Text style={styles.subtitle}>
        To make sure you have safely backed up your 12 recovery words, please enter the requested words below.
      </Text>

      {quizIndices.length === 2 && (
        <View style={styles.card}>
          <Text style={styles.label}>Enter Word #{quizIndices[0] + 1}:</Text>
          <TextInput
            style={styles.input}
            value={input1}
            onChangeText={setInput1}
            autoCapitalize="none"
            placeholder={`Word #${quizIndices[0] + 1}`}
          />

          <Text style={styles.label}>Enter Word #{quizIndices[1] + 1}:</Text>
          <TextInput
            style={styles.input}
            value={input2}
            onChangeText={setInput2}
            autoCapitalize="none"
            placeholder={`Word #${quizIndices[1] + 1}`}
          />

          {error ? <Text style={styles.errorText}>{error}</Text> : null}

          <Pressable style={styles.btnVerify} onPress={handleVerify}>
            <Text style={styles.btnText}>Verify & Set PIN</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {flex: 1, padding: 20, backgroundColor: '#f8f9fa'},
  title: {fontSize: 22, fontWeight: 'bold', color: '#1a202c', marginBottom: 8},
  subtitle: {fontSize: 14, color: '#4a5568', marginBottom: 20, lineHeight: 20},
  card: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  label: {fontSize: 14, fontWeight: '600', color: '#2d3748', marginBottom: 6},
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
    fontSize: 15,
    backgroundColor: '#fff',
  },
  btnVerify: {
    backgroundColor: '#3182ce',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  btnText: {color: '#fff', fontWeight: 'bold', fontSize: 16},
  errorText: {color: '#e53e3e', fontSize: 14, marginBottom: 12},
});
