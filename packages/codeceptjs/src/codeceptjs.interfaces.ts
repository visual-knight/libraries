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
  WebdriverIO = 'WebDriverIO',
  Webdriver = 'WebDriver',
  Puppeteer = 'Puppeteer',
  Protractor = 'Protractor',
  Nightmare = 'Nightmare'
}
