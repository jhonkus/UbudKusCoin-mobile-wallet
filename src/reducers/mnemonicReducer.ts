// import the dependency

import {MNEMONIC} from '../constants';

// reducer
const initialState: [] = [];

const mnemonicReducer = (
  mnemonic = initialState,
  action: {type: string; payload: []},
) => {
  switch (action.type) {
    case MNEMONIC:
      return action.payload;
  }
  return mnemonic;
};

export default mnemonicReducer;
