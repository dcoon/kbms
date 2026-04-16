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

export enum CellVoltageLevel {
    VeryHigh = 3700,
    High = 3400,
    Medium = 3200,
    Low = 2800,
    VeryLow = 2500,
    Unknown
};

export enum CellDeltaVLevel {
    VeryHigh = 150,
    High = 100,
    Medium = 60,
    Low = 30,
    VeryLow = 15,
    Unknown
};





export interface BatteryData {
    deviceId: string;
    batteryType?: number;
    get batteryTypeName(): string;
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


enum BatteryCapacityLevel {
    HLX1200 = 140000,
    HLX2400 = 260000,
    HLX3600 = 360000,
    Unknown = 0
}

export class BatteryDataBase implements BatteryData {
    deviceId: string = "";
    batteryType?: number;
    get batteryTypeName(): string {
        if(this.capacity < BatteryCapacityLevel.HLX1200) {
            return "HLX1200";
        } else if (this.capacity < BatteryCapacityLevel.HLX2400) {
            return "HLX2400";
        } else if (this.capacity < BatteryCapacityLevel.HLX3600) {
            return "HLX3600";
        } else {
            return "Unknown";
        }        
    }
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
export enum BatterySoCLevel {
    VeryHigh = 80,
    High = 60,
    Medium = 40,
    Low = 20,
    VeryLow = 0
}

