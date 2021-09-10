import { combineReducers } from "redux";
import mnemonicReducer  from './mnemonicReducer';

const mixReducer = combineReducers({
    mnemonic: mnemonicReducer,
});


export default mixReducer;