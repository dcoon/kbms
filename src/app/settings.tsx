import { List } from '@/components/list/list-item';
import { shareLogFile } from '@/components/ui/file-share';
import { ScreenLayout } from '@/components/ui/screen-layout';
import { LogLevel, LogLevelOptions, Settings } from '@/services/settings/settings-service';
import { useAtom } from 'jotai';
import React, { useCallback } from 'react';
import { ScrollView } from 'react-native';
import { IconButton, Switch } from 'react-native-paper';
import { Dropdown } from 'react-native-paper-dropdown';




export default function SettingsScreen() {



  function ButtonItem({ title, description, icon, buttonIcon = icon, onPress }: { title: string, description: string, icon: string, buttonIcon?: string, onPress: () => void }) {
    return (
      <List.Item
        title={title}
        description={description}
        icon={icon}
        right={<IconButton mode="contained-tonal" onPress={onPress} icon={buttonIcon}/>}
      />
    );
  }

  function BooleanItem({ title, description, value, icon, disabled,onValueChange }: { title: string, description: string, value: boolean, icon: string, disabled?: boolean, onValueChange: (value: boolean) => void }) {
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
        <BooleanItem title="Send Logs to Server" description="Allow the app to send logs to the server for diagnostics" icon="bug"
          value={sendLogsToServer}
          disabled={true}
          onValueChange={(value) => setSendLogsToServer(value)} />
        <ButtonItem title="Share Logs" description="Share the current logs for debugging purposes" icon="share" onPress={shareLogFileCallback} />


      </List.Accordion>
    );
  }


  function DataAccordion() {
    return (
      <List.Accordion id="data" title="Data" description="Manage your stored data" >
        <ButtonItem title="Clear Settings" description="Clear ALL settings" icon="cog" buttonIcon='delete' onPress={() => { }} />
        <ButtonItem title="Clear Favorites" description="Clear your list of favorite devices" icon='heart' buttonIcon='delete' onPress={() => { }} />
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

  return (
    <ScreenLayout
      title="Settings"
    // actions={<AppBarActions />}
    >
      <ScrollView>
        <List.AccordionGroup>
          <NotificationsAccordion />
          <LogAccordion />
          <DataAccordion />
          <AdvancedAccordion />
        </List.AccordionGroup>
      </ScrollView>

    </ScreenLayout>
  );


}
