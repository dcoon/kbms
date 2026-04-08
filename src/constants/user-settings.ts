import { Setting } from '@/components/settings-provider';

export type LogLevel = 'error' | 'warning' | 'info' | 'debug';

export type DeviceId = string;
export type DeviceFavorite = {
  id: DeviceId;
  name: string; 
}

// @settingsGroup({ label: "Test Settings", description: "Settings for tests" })
export class UserSettings {

  private _notificationsEnabled: boolean = true;
  private _logLevel: LogLevel = 'error';
  private _favorites: DeviceFavorite[] = [];
  private _sendLogsToServer: boolean = true;

//   @PropertySetting({ label: "Notifications Enabled", description: "Enable or disable notifications", icon: "notifications" })
//   notificationsEnabled: boolean = true;

 get notificationsEnabled(): boolean {
    // log.debug("notificationsEnabled: Getting notificationsEnabled: ", this._notificationsEnabled);
    return this._notificationsEnabled;
  }

  @Setting({ label: "Notifications Enabled", description: "Enable or disable notifications", icon: "notifications" })
  set notificationsEnabled(value: boolean) {
    this._notificationsEnabled = value;
    // log.debug("notificationsEnabled: Setting notificationsEnabled to: ", value);
  }

  get logLevel(): LogLevel {
    return null as any;
  }

  @Setting({ label: "Log Level", description: "Set the log level", icon: "settings" })
  set logLevel(value: LogLevel) {
  }

 get favorites(): DeviceFavorite[] {
    return this._favorites;
  }

  @Setting({ label: "Favorites", description: "Set the favorite devices", icon: "heart" })
  set favorites(value: DeviceFavorite[]) {
    this._favorites = value;    
  }  

    get sendLogsToServer(): boolean {
    return this._sendLogsToServer;
  }  

  @Setting({ label: "Send Logs To Server", description: "Send logs to server", icon: "server" })      
  set sendLogsToServer(value: boolean) {
    this._sendLogsToServer = value;
  }



}
