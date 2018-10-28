import { Base64 } from '../process-screenshot';

export interface IBrowserDriverContext {
  isIOS?: boolean;
  isMobile?: boolean;
  // TODO: get interface for desiredCapabilities (default selenium?)
  desiredCapabilities: any;
  executeScript(script: (...args: any[]) => any, ...args: any[]): Promise<any>;
  selectorExecuteScript?(
    selector: string,
    script: (selectorElements: HTMLElement[], ...args: any[]) => any,
    ...args: any[]
  ): Promise<any>;
  pause(timeInMilliseconds: number): Promise<void>;
  screenshot(): Promise<any>; // ??Base64 has no value property....what is it
}
