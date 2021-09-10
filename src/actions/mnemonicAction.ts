// Action Creators

import {MNEMONIC} from '../constants';

export const mnemonicAction = (args: {
  words: string;
  arrayWords: string[];
}) => ({
  type: MNEMONIC,
  payload: args,
});
