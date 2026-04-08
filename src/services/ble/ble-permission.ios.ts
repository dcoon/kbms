import { blelog as log } from '@/services/log/log-service';


  export async function requestPermission(): Promise<boolean> {
    log.error("BLEService: Running on iOS, requesting permissions...NOT IMPLEMENTED");
    return false;
  }
