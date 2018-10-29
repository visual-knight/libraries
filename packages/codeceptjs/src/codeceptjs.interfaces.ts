import { IProcessScreenshotOptionsUser } from '@visual-knight/core';

export interface IProcessCodeceptJsOptions extends IProcessScreenshotOptionsUser {
  useHelper: CODECEPTJS_HELPER;
}

export interface ICompareScreenshotOptions {
  viewport?: boolean;
  hide?: string[];
  remove?: string[];
  element?: string;
}

export enum CODECEPTJS_HELPER {
  WebdrvierIO = 'WebDriverIO',
  Puppeteer = 'Puppeteer',
  Protractor = 'Protractor',
  Nightmare = 'Nightmare'
}
