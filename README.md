# Welcome to the KBMS project 👋

KBMS is a mobile app to monitor and configure KiloVault HLX+ LiFePO4 batteries. It is a replacement for the now defunct KiloVault app. It is free and open source. 


<div align="center">
  <img src="assets/images/screenshot-battery-ipad.png" alt="screenshot" width="200">
</div>



KBMS is still in its early stages and hasn't been submitted to app stores yet. But there is an early preview build available for testing (Android only).
 Expect bugs! Check the discussion group for known issues and workarounds. 
 
## Get the app

### iOS

KBMS is in TestFlight Internal.  If you want to help test, DM me with your contact info. Hopefully, we'll get to TF External within the next week or so.

- ***2026-5-8*** Submitted to TF External. The Beta should be open to everyone within a day or two.  Check the [beta download](https://testflight.apple.com/join/bK6SGRHe) 

### Android

1. Install the Android test build

- ***2026-5-7*** Submitted to Play Store Beta. The Beta should be open to everyone within a few days. Check back here for updates. For now the test build is useable but please don't submit issues until the Beta is available.

![Text Build QR Code](assets/images/test-build-qr-code-b1.png)
https://expo.dev/accounts/davidcoon/projects/kbms/builds/5f55b7f9-63d9-475f-8f14-18316e3afdcd

Click Install on the build page to download; open with apk installer;  then say Yes or Allow to all the prompts. Be aware, you'll be side loading an app on your device without review by Google. Make sure you trust this project first.

 2. Run the app

On the Devices tab,  press the play icon in the upper right corner to start scanning for nearby batteries.  Click on a KiloVault battery. You MAY need to press play again to connect to the battery.  Graphs and data should appear within a few seconds.

3. Troubleshooting

Information and error messages will popup at the bottom of the screen.  The two most common are Bluetooth isn't on and Can't connect to device.  If you can't connect to a nearby battery or it doesn't show up when scanning on the Devices tab, try turning Bluetooth off and on again. 

If all else fails, go to Settings, change the Log Level to Info or Debug, reproduce the error, and Share the logs on the [discussion group](https://github.com/dcoon/kbms/discussions).


## Support & Feature Requests

Feel free to ask questions in the discussion group. Screenshots and logs (LogLevel=INFO) are very helpful. Feature requests are welcome. The development roadmap is viewable in the Project Plan. 

[Project Plan](https://github.com/users/dcoon/projects/2)

## Contribute

1. Artwork

Icons, splash screens, graphs...all are welcome. Submit a pull request or post to the discussion group. 

2. Translations

Internationalization is on the short term roadmap. We'll need help translating text and icons.

3. Development

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app) and written in Typescript. Pull the repo and build using standard Expo tools. Submit a pull request with new features and fixes. If you need help with architecture, post questions in the discussions. 
## Join the community

Join our community of developer~~s~~ and battery owners.

- [Wiki]([https://docs.expo.dev/develop/development-builds/introduction/](https://github.com/dcoon/kbms/wiki))
- [Discussions](https://github.com/dcoon/kbms/discussions)
- [Issues]([https://docs.expo.dev/workflow/ios-simulator/](https://github.com/dcoon/kbms/issues))



