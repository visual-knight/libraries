import { IProcessScreenshotOptionsUser } from "@visual-knight/core";

export interface IProcessCodeceptJsOptions extends IProcessScreenshotOptionsUser {
  useHelper: CODECEPTJS_HELPER;
}

export enum CODECEPTJS_HELPER {
  WbdrvierIO = "WebDriverIO",
  Puppeteer = "Puppeteer",
  Protractor = "Protractor",
}
