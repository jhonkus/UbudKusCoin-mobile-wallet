UbudKusCoin Mobile Wallet


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

- API: `http://10.0.2.2:5001`
- CometBFT RPC: `http://10.0.2.2:26657`

These HTTP defaults are development-only. A real deployment must use HTTPS,
an authenticated gateway, and a restricted CometBFT RPC; never expose the
CometBFT RPC directly to the public internet. The current wallet still keeps
the seed in Redux memory for this integration phase. Secure OS-backed seed
storage and PIN-based unlock are required before a production release.




### Generating an upload key#

keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

