UbudKusCoin Mobile Wallet


#How to install:

##Clone source code to your laptop
- git clone git@github.com:jhonkus/UbudKusCoin-mobile-wallet.git

##Insall dependency
- yarn install

##Open Android Studio, Create new AVD and run it

##Run app on android
- yarn android

##Run app on macos, need xcode
- yarn ios


### Generating an upload key#

keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

