import { LoadableState, State } from '@/services/ble/ble-types';




export enum BleDeviceTypeIcons {
    Device = 'devices',
    Service = 'wrench-outline',
    Characteristic = 'tag-multiple-outline',
    Descriptor = 'tag-multiple-outline',
    Loading = 'loading'
}




export function getIconForLoadableState(state: LoadableState, hasDataIcon: string = 'unknown'): string {
    switch (state) {
        case LoadableState.hasData:
            return hasDataIcon;
        case LoadableState.hasError:
            return 'alert-circle-outline';
        case LoadableState.loading:
            return 'loading';
        default:
            return 'help-circle-outline';
    }

}



export function getIconForBleState(state: State) {

    switch (state) {
        case State.PoweredOn:
            return 'bluetooth';
        case State.PoweredOff:
            return 'bluetooth-off';
        case State.Resetting:
            return 'bluetooth-connect';
        case State.Unauthorized:
            return 'bluetooth-settings';
        case State.Unsupported:
            return 'bluetooth-off';
        case State.Unknown:
            return 'bluetooth-off';
        default:
            return 'bluetooth-off';
    }

}
