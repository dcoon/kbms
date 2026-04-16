import { DeviceId } from "react-native-ble-plx";

export type BatteryIdentifier = DeviceId;


export enum BatteryStatusFlags {
    HV = 'HV', // High Voltage
    LV = 'LV', // Low Voltage
    OCC = 'OCC', // Over Current Charge
    OCD = 'OCD', // Over Current Discharge
    LTD = 'LTD', // Low Temperature Discharge
    LTC = 'LTC', // Low Temperature Charge
    HTD = 'HTD', // High Temperature Discharge
    HTC = 'HTC'  // High Temperature Charge
}

export enum BatteryStatusBitMask {
    HV = 0x01,
    LV = 0x02,
    OCC = 0x04,
    OCD = 0x08,
    LTD = 0x10,
    LTC = 0x20,
    HTD = 0x40,
    HTC = 0x80
}

export class BatteryStatus {

    HV: boolean = false; // High Voltage
    LV: boolean = false; // Low Voltage
    OCC: boolean = false; // Over Current Charge
    OCD: boolean = false; // Over Current Discharge
    LTD: boolean = false; // Low Temperature Discharge
    LTC: boolean = false; // Low Temperature Charge
    HTD: boolean = false; // High Temperature Discharge
    HTC: boolean = false; // High Temperature Charge

    constructor(rawStatus?: number) {

        if (rawStatus) {
            this.HV = (rawStatus & BatteryStatusBitMask.HV) === BatteryStatusBitMask.HV;
            this.LV = (rawStatus & BatteryStatusBitMask.LV) === BatteryStatusBitMask.LV;
            this.OCC = (rawStatus & BatteryStatusBitMask.OCC) === BatteryStatusBitMask.OCC;
            this.OCD = (rawStatus & BatteryStatusBitMask.OCD) === BatteryStatusBitMask.OCD;
            this.LTD = (rawStatus & BatteryStatusBitMask.LTD) === BatteryStatusBitMask.LTD;
            this.LTC = (rawStatus & BatteryStatusBitMask.LTC) === BatteryStatusBitMask.LTC;
            this.HTD = (rawStatus & BatteryStatusBitMask.HTD) === BatteryStatusBitMask.HTD;
            this.HTC = (rawStatus & BatteryStatusBitMask.HTC) === BatteryStatusBitMask.HTC;
        }

    }
}

export interface CellData {
    voltage: number;
}

export interface BatteryData {
    deviceId: string;
    batteryType?: number;
    rawStatus?: number; // {HV, LV, OCC, OCD, LTD, LTC, HTD, HTC};   
    status?: BatteryStatus;
    infoStatus?: number;
    afeStatus?: number;
    voltage: number;
    current: number;
    capacity: number;
    soc: number;
    cycles: number;
    temperature: number;
    lastUpdated: Date;

    cells: CellData[];
}

export class BatteryDataBase implements BatteryData {
    deviceId: string = "";
    batteryType?: number;
    rawStatus?: number; // {HV, LV, OCC, OCD, LTD, LTC, HTD, HTC};   
    status?: BatteryStatus = undefined;
    infoStatus?: number;
    afeStatus?: number;
    voltage: number = 0;
    current: number = 0;
    capacity: number = 0;
    soc: number = 0;
    cycles: number = 0;
    temperature: number = 0;
    lastUpdated: Date = new Date();

    cells: CellData[] = [];
}
