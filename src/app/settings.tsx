import { List } from '@/components/list/list-item';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { LogLevel, LogLevelOptions, Settings } from '@/services/settings/settings-service';
import * as Updates from 'expo-updates';
import { useAtom } from 'jotai';
import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';
import { useTheme } from 'react-native-paper';

import { shareLogFile } from '@/components/ui/file-share';
import { ThemeType } from '@/theme/theme';
import * as Application from 'expo-application';
import { IconSource } from 'react-native-paper/lib/typescript/components/Icon';




export default function SettingsScreen() {





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
    const theme = useTheme() as ThemeType;

    const onClearFavorites = useCallback(() => {
      setFavorites([]);
    }, [setFavorites]);

    return (
      <List.Accordion id="data" title="Data" description="Manage your stored data" >
        {/* <ButtonItem title="Clear Settings" description="Clear ALL settings" icon="cog" onPress={() => { }}  /> */}
        <List.Item title="Clear Favorites" description="Clear your list of favorite devices" icon={theme.icons.favorite.true as IconSource} valueIcon={theme.icons.delete as IconSource} onPress={onClearFavorites} />
      </List.Accordion>
    );
  }

  // function AdvancedAccordion() {

  //   const [developerMode, setDeveloperMode] = useAtom(Settings.developerMode);


  //   return (
  //     <List.Accordion id="advanced" title="Advanced" description="Advanced settings">
  //       <List.Item title="Developer Mode" description="Enable developer mode for debugging" icon="dev-to"
  //         editable={true}
  //         value={developerMode}
  //         onPress={(value) => setDeveloperMode(value)}
  //       />
  //     </List.Accordion>
  //   );
  // }

  function AboutAccordion() {

    const theme = useTheme();


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
          <List.Item title="Version" value={Application.nativeApplicationVersion} icon="information" />
          <List.Item title="Build" value={Application.nativeBuildVersion} icon="information" />
          {/* <List.Item title="Release Type" value={appReleaseTypeToDescription(Application.)} icon="information" /> */}
          <List.Item title="Application ID" value={Application.applicationId} icon="information" />
          <List.Item title="Application Name" value={Application.applicationName} icon="information" />
          <List.Item title="Android ID" value={Application.getAndroidId} icon="information" />
        </List.Section>

        <List.Section title="Runtime Information">
          <List.Item title="Channel" value={Updates.channel} icon="information" />
          <List.Item title="Runtime" value={Updates.runtimeVersion} icon="information" />
          <List.Item title="Updated" value={Updates.createdAt} icon="information" />
          <List.Item title="Check Updates" value={Updates.checkAutomatically} icon="information" />
          <List.Item title="Theme Version" icon="github" value={theme.version} />
          <List.Item title="License" description="MIT License" icon="file-document" />
          <List.Item title="Contact Support" description="https://github.com/dcoon/kbms" icon="lifebuoy" />
        </List.Section>
      </List.Accordion>
    );
  }

  return (
    <ScreenLayout
      title="Settings"
    // actions={<AppBarActions />}
    >
      <ScrollView>
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
