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

##Run app on android
- yarn android

##Run app on macos, need xcode
- yarn ios




### Generating an upload key#

keytool -genkeypair -v -storetype PKCS12 -keystore my-upload-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

