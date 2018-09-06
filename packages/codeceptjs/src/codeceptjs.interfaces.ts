import { IProcessScreenshotOptionsUser } from "@visual-knight/core";

export interface IProcessCodeceptJsOptions extends IProcessScreenshotOptionsUser {
  useHelper: CODECEPTJS_HELPER;
}

export enum CODECEPTJS_HELPER {
  WebdrvierIO = "WebDriverIO",
  Puppeteer = "Puppeteer",
  Protractor = "Protractor",
}
