import { List } from '@/components/list/list-item';
import { shareLogFile } from '@/components/ui/file-share';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { LogLevel, LogLevelOptions, Settings } from '@/services/settings/settings-service';
import * as Updates from 'expo-updates';
import { useAtom } from 'jotai';
import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';
import { IconButton, Switch, useTheme } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';

import * as Application from 'expo-application';




export default function SettingsScreen() {



  function ButtonItem({ title, description, icon, buttonIcon = icon, onPress }: { title: string, description: string, icon: string, buttonIcon?: string, onPress: () => void }) {
    return (
      <List.Item
        title={title}
        description={description}
        icon={icon}
        right={<IconButton mode="contained-tonal" onPress={onPress} icon={buttonIcon} />}
      />
    );
  }

  function BooleanItem({ title, description, value, icon, disabled, onValueChange }: { title: string, description: string, value: boolean, icon: string, disabled?: boolean, onValueChange: (value: boolean) => void }) {
    return (
      <List.Item
        title={title}
        description={description}
        icon={icon}
        right={<Switch
          value={value ? true : false}
          onValueChange={onValueChange}
          disabled={disabled}
        />}
      />

    );
  }


  function DropdownItem({ title, description, icon, value, onValueChange, options }: { title: string, description: string, icon: string, value: string, onValueChange: (value: string | undefined) => void, options: { label: string, value: string }[] }) {

    function DropdownItemRight({ options, value, onValueChange }: { options: { label: string, value: string }[], value: string, onValueChange: (value: string | undefined) => void }) {

      return (
        <Dropdown
          // label={title}
          // placeholder={"Select " + title}
          options={options}
          value={value}
          onSelect={onValueChange}

        />
      );
    }


    return (

      <List.Item title={title} description={description} icon={icon}
        right={<DropdownItemRight options={options} value={value} onValueChange={onValueChange} />}
      />
    );
  }

  function NotificationsAccordion() {

    const [notificationsEnabled, setNotificationsEnabled] = useAtom(Settings.notificationsEnabled);
    return (
      <List.Accordion id="notifications" title="Notifications" description="Control app notifications and alerts"  >
        <BooleanItem title="Enable Notifications" description="Allow the app to send you notifications about important events" icon="bell"
          value={notificationsEnabled}
          onValueChange={(value) => setNotificationsEnabled(value)} />
      </List.Accordion>
    );
  }

  function LogAccordion() {

    const [sendLogsToServer, setSendLogsToServer] = useAtom(Settings.sendLogsToServer);
    const [logLevel, setLogLevel] = useAtom(Settings.logLevel);

    const shareLogFileCallback = useCallback(() => {
      shareLogFile();
    }, []);

    return (
      <List.Accordion id="logging" title="Logging" description="Configure log collection and error reporting"   >
        <DropdownItem title="Log Level" description="Set the log level for the app" icon="bug"
          options={LogLevelOptions}
          value={logLevel}
          onValueChange={(value) => setLogLevel(value ? value as LogLevel : LogLevel.error)} />
        {/* <BooleanItem title="Send Logs to Server" description="Allow the app to send logs to the server for diagnostics" icon="bug"
          value={sendLogsToServer}
          disabled={true}
          onValueChange={(value) => setSendLogsToServer(value)} /> */}
        <ButtonItem title="Share Logs" description="Share the current logs for debugging purposes" icon="share" onPress={shareLogFileCallback} />


      </List.Accordion>
    );
  }



  function DataAccordion() {
    const [favorites, setFavorites] = useAtom(Settings.favorites);


    const onClearFavorites = useCallback(() => {
      setFavorites([]);
    }, [setFavorites]);

    return (
      <List.Accordion id="data" title="Data" description="Manage your stored data" >
        {/* <ButtonItem title="Clear Settings" description="Clear ALL settings" icon="cog" onPress={() => { }}  /> */}
        <ButtonItem title="Clear Favorites" description="Clear your list of favorite devices" icon='heart' buttonIcon='delete' onPress={onClearFavorites} />
      </List.Accordion>
    );
  }

  function AdvancedAccordion() {

    const [developerMode, setDeveloperMode] = useAtom(Settings.developerMode);


    return (
      <List.Accordion id="advanced" title="Advanced" description="Advanced settings">
        <List.Item title="Developer Mode" description="Enable developer mode for debugging" icon="dev-to"
          editable={true}
          value={developerMode}
          onChange={(value) => setDeveloperMode(value)}
        />
      </List.Accordion>
    );
  }

  function AboutAccordion() {

    const theme = useTheme();

    return (
      <List.Accordion id="about" title="About" description="Learn more about the app and its developers">
        <List.Item title="Build" value={Application.nativeBuildVersion} icon="information" />
        <List.Item title="Channel" value={Updates.channel} icon="channgel"/>
        <List.Item title="Runtime" value={Updates.runtimeVersion} icon="runtime"/>
        <List.Item title="SDK Version" value={Application.nativeApplicationVersion} icon="information" />
        <List.Item title="Theme Version" icon="github" value={theme.version} />
        <List.Item title="License" description="MIT License" icon="file-document" />
        <List.Item title="Contact Support" description="Get help and support for the app" icon="lifebuoy" />
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
