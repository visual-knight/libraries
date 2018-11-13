import { IProcessScreenshotOptionsUser } from '@visual-knight/core';

export interface IProcessCodeceptJsOptions extends IProcessScreenshotOptionsUser {
  useHelper: CODECEPTJS_HELPER;
}

export interface ICompareScreenshotOptions extends ICompareScreenshotOptionsUser {
  viewport?: boolean;
  element?: string;
}

export interface ICompareScreenshotOptionsUser {
  hide?: string[];
  remove?: string[];
  additional?: any;
}

export enum CODECEPTJS_HELPER {
  WebdrvierIO = 'WebDriverIO',
  Puppeteer = 'Puppeteer',
  Protractor = 'Protractor',
  Nightmare = 'Nightmare'
}
