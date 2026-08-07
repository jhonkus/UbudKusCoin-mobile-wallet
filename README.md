UbudKusCoin Mobile Wallet

## About this app

UbudKusCoin Mobile Wallet is the official mobile wallet for UbudKusCoin (UKC), a
purpose-built blockchain used by the UbudKus community in Bali, Indonesia as a
local digital currency. This React Native app lets users hold and transact UKC
directly on the UKC testnet from their mobile device.

Key capabilities:

- Create a new wallet from a generated BIP-39 seed phrase or open an existing
  wallet, protected by a 6-digit PIN.
- View the account balance and live transaction history on the dashboard.
- Send UKC to another UKC address, with amount/fee validation and an on-device
  signature using the canonical UKC (KTX2) transaction envelope.
- Receive UKC by sharing the wallet address.
- Scan a UKC address from a QR code to pre-fill the send form.
- Review full details and on-chain status of any transaction.

The app is under active development and currently targets the UKC testnet. It
integrates directly with the UKC protocol and node API rather than depending on
a third-party wallet backend.

#How to install:

##Install SDK, tools and IDE
- install android studio
- install nodejs v16 or latest stable
- install java
- install watchman
- set PATH for JAVA JDK, ANDROID SDK
- make sure all installed properly


##Clone source code to your laptop
- git clone git@github.com:jhonkus/UbudKusCoin-mobile-wallet.git

##Delete folder node_modules and yarn.lock

##Insall dependency
- yarn install

##Open Android Studio, Create new AVD and run it

##Run run metro first
- yarn start

##Run app on android
- yarn android

##Run app on macos, need xcode
- yarn ios

## UKC testnet transaction integration

The wallet now uses the UbudKusCoin protocol directly. It derives the first
account at `m/0`, creates the network's Base58Check address, signs the canonical
KTX2 envelope with secp256k1 DER signatures, reads the canonical nonce from the
node API, and submits the bytes through CometBFT `broadcast_tx_sync`.

For the local Android emulator, the defaults are:

- API: `http://10.0.2.2:5100`
- CometBFT RPC: `http://10.0.2.2:26657`

These HTTP defaults are development-only. A real deployment must use HTTPS,
an authenticated gateway, and a restricted CometBFT RPC; never expose the
CometBFT RPC directly to the public internet. The current wallet still keeps
the seed in a locked in-memory session for this integration phase; it is no
longer stored in Redux or navigation state. Secure OS-backed seed storage is
still required before a production release.

## QR code scanner

The Scan screen uses `react-native-vision-camera` to scan UKC addresses from QR
codes. Camera permission is requested on first use; when a valid address is
decoded it is pre-filled into the Send screen. On iOS the
`NSCameraUsageDescription` string is already declared in `Info.plist`.

## Security notes

- The app auto-locks the wallet session when it enters the background and
  prompts for the PIN on return to the foreground.
- PIN verification uses a constant-time comparison to reduce timing side
  channels.
- The seed phrase is kept only in a locked in-memory session and is never stored
  in Redux or navigation state (the legacy Redux layer has been removed).

## Tests

Jest is used for unit tests. Run them with:

- yarn test

Coverage includes the `WalletSession` lifecycle (setup, unlock, lock, constant
time comparison) and the `react-native-vision-camera` module is mocked so the
test suite runs without a camera device.




### Generating an upload key#

keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

