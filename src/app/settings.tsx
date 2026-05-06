import { List } from '@/components/list/list-item';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { LogLevel, LogLevelOptions, Settings } from '@/services/settings/settings-service';
import * as Updates from 'expo-updates';
import { useAtom } from 'jotai';
import React, { useCallback } from 'react';
import { Alert, Platform, ScrollView, View } from 'react-native';
import { Text, TouchableRipple, useTheme } from 'react-native-paper';

import { IconFromIconSource } from '@/components/ble/icons';
import { shareLogFile } from '@/components/ui/file-share';
import * as Bluetooth from '@/services/ble/ble-service';
import { ThemeType } from '@/theme/theme';
import * as Application from 'expo-application';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';



// TODO: refactor to remove embedded components.
export default function SettingsScreen() {

  const theme = useTheme() as ThemeType;



  // function NotificationsAccordion() {

  //   const [notificationsEnabled, setNotificationsEnabled] = useAtom(Settings.notificationsEnabled);
  //   return (
  //     <List.Accordion id="notifications" title="Notifications" description="Control app notifications and alerts"  >
  //       <BooleanItem title="Enable Notifications" description="Allow the app to send you notifications about important events" icon="bell"
  //         value={notificationsEnabled}
  //         onValueChange={(value) => setNotificationsEnabled(value)} />
  //     </List.Accordion>
  //   );
  // }

  function LogAccordion() {

    const [sendLogsToServer, setSendLogsToServer] = useAtom(Settings.sendLogsToServer);
    const [logLevel, setLogLevel] = useAtom(Settings.logLevel);
    const theme = useTheme() as ThemeType;


    const logLevelOptionsAndValue = [logLevel, ...LogLevelOptions] as const;

    const shareLogFileCallback = useCallback(() => {
      shareLogFile();
      // pickAndShareFile();
    }, []);

    return (
      <List.Accordion id="logging" title="Logging" description="Configure log collection and error reporting"   >
        <List.Item title="Log Level" description="Set the log level for the app"
          icon={theme.icons.log as IconSource}
          value={logLevelOptionsAndValue}
          onPress={(value) => setLogLevel(value ? value as LogLevel : LogLevel.error)} />

        <List.Item title="Share log" description="Share the current log for debugging purposes"
          icon={theme.icons.log as IconSource}
          valueIcon={theme.icons.share as IconSource}
          onPress={shareLogFileCallback} />

      </List.Accordion>
    );
  }



  function DataAccordion() {
    const [favorites, setFavorites] = useAtom(Settings.favorites);
    const [demoMode, setDemoMode] = useAtom(Bluetooth.demoMode);

    const theme = useTheme() as ThemeType;

    const onClearFavorites = useCallback(() => {
      setFavorites([]);
    }, [setFavorites]);

    return (
      <List.Accordion id="data" title="Data" description="Manage your stored data" >
        {/* <ButtonItem title="Clear Settings" description="Clear ALL settings" icon="cog" onPress={() => { }}  /> */}
        <List.Item title="Clear Favorites" description="Clear your list of favorite devices" icon={theme.icons.favorite.true as IconSource} valueIcon={theme.icons.delete as IconSource} onPress={onClearFavorites} />
        <List.Item title="Demo Mode" description="Enable demo mode with mock data and no external connections"
          icon={theme.icons.demo as IconSource}
          value={demoMode} 
          onPress={() => setDemoMode(!demoMode)} 
          editable={true} />
      </List.Accordion>
    );
  }


  function alert(title: string, message?: string, onConfirmed?: () => void) {
    if (Platform.OS === 'web') {
      const text = message ? `${title}\n\n${message}` : title;
      if (onConfirmed === undefined) {
        window.alert(text);
      } else {
        const confirmed = window.confirm(text);
        if (confirmed && onConfirmed) {
          onConfirmed();
        }
      }
    } else {
      Alert.alert(title, message, [{ text: 'OK', onPress: onConfirmed }]);
    }
  }

  function UpdateAvailableIcon() {

    const [updateResult, setUpdateResult] = React.useState<Updates.UpdateCheckResult | undefined>(undefined);
    const theme = useTheme() as ThemeType;
    const icon = theme.icons.settings.app.update as IconSource;


    function isDevelopmentBuild() {
      // __DEV__ is true when running from Metro; Updates.isEnabled is false in environments
      // where OTA updates are not available (e.g. Expo Go/dev runtime).
      return __DEV__ || !Updates.isEnabled;
    }

    const fetchUpdates = useCallback(async () => {
      const fetchUpdate = await Updates.fetchUpdateAsync();
      alert('Update downloaded!', 'Restarting app...', async () => {
        await Updates.reloadAsync();
      });
    }, []);


    const checkForUpdates = useCallback(async () => {

      if (isDevelopmentBuild()) {
        return { isAvailable: false };
      }

      const result = await Updates.checkForUpdateAsync();
      setUpdateResult(result);

      return result;
    }, []);

    // const checkForUpdatesAtStartup = useEffect(() => {
    //   checkForUpdates();
    // }, [checkForUpdates]);

    const checkIfUserWantsToUpdate = useCallback(() => {
      alert('An update is available! Do you want to download and install it now?', undefined, fetchUpdates);
    }, [updateResult, fetchUpdates]);

    const onPressCheckForUpdates = useCallback(async () => {
      if (isDevelopmentBuild()) {
        alert('You are running a development build. Update checks are not available.');
        return;
      }

      const update = await checkForUpdates();
      if (update.isAvailable) {
        checkIfUserWantsToUpdate();
      } else {
        alert('Your app is up to date!');
      }
    }, []);


    return (
      <View style={{ flexDirection: 'row', alignItems: 'center', columnGap: 4 }}>
        <TouchableRipple onPress={onPressCheckForUpdates} >
          <IconFromIconSource source={icon} theme={theme} />
        </TouchableRipple>
        <Text>{Updates.createdAt?.toLocaleDateString()}</Text>
      </View>
    );

  }


  function AboutAccordion() {

    const theme = useTheme() as ThemeType;


    function appReleaseTypeToDescription(releaseType: Application.ApplicationReleaseType | undefined): string {
      switch (releaseType) {
        case Application.ApplicationReleaseType.DEVELOPMENT:
          return "Development";
        case Application.ApplicationReleaseType.APP_STORE:
          return "Store";
        case Application.ApplicationReleaseType.SIMULATOR:
          return "Test Flight";
        case Application.ApplicationReleaseType.AD_HOC:
          return "Ad Hoc";
        case Application.ApplicationReleaseType.ENTERPRISE:
          return "Enterprise";
        default:
          return "Unknown";
      }
    }

    return (
      <List.Accordion id="about" title="About" description="Learn more about the app and its developers">

        <List.Section title="App Information" >
          <List.Item title="Version" value={Application.nativeApplicationVersion} icon={theme.icons.settings.app.version as IconSource} />
          <List.Item title="Build" value={Application.nativeBuildVersion} icon={theme.icons.settings.app.build as IconSource} />
          <List.Item title="Updated" icon={theme.icons.settings.app.updated as IconSource} right={<UpdateAvailableIcon />} />
          <List.Item title="License" description="MIT License" icon={theme.icons.settings.app.license as IconSource} />
          <List.Item title="Contact Support" description="https://github.com/dcoon/kbms" icon={theme.icons.settings.app.contact as IconSource} />

        </List.Section>

        <List.Section title="Runtime Information">
          <List.Item title="Application ID" value={Application.applicationId} icon={theme.icons.settings.app.id as IconSource} />
          <List.Item title="Android ID" value={Application.getAndroidId} icon={theme.icons.settings.app.id as IconSource} />
          <List.Item title="Application Name" value={Application.applicationName} icon={theme.icons.settings.app.name as IconSource} />
          <List.Item title="Channel" value={Updates.channel} icon={theme.icons.settings.app.channel as IconSource} />
          <List.Item title="Runtime" value={Updates.runtimeVersion} icon={theme.icons.settings.app.runtime as IconSource} />
          <List.Item title="Theme Version" icon={theme.icons.settings.app.version as IconSource} value={theme.version} />
        </List.Section>
      </List.Accordion>
    );
  }

  return (
    <ScreenLayout
      title="Settings"
    >
      <ScrollView
        contentContainerStyle={theme.components.scrollView.contentContainerStyle}
      >
        <List.AccordionGroup>
          {/* <NotificationsAccordion /> */}
          <LogAccordion />
          <DataAccordion />
          {/* <AdvancedAccordion /> */}
          <AboutAccordion />
        </List.AccordionGroup>
      </ScrollView>

    </ScreenLayout>
  );


}
